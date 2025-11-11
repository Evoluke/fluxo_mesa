"""Ferramentas para converter definições BPMN em planilhas de alçada.

Este módulo lê um arquivo BPMN (em formato XML) compatível com o motor
Activiti e gera uma planilha (CSV com separador '/') indicando quais papéis
participam do fluxo para cada combinação de risco e faixa de valor da
proposta.

Uso rápido:

    python -m bpmn_to_planilha caminho/para/processo.bpmn saida.csv

O arquivo de saída seguirá o padrão descrito pelo time de negócios:
```
valorEndividamento/valorProposta/RISCO/Assistente Sede/Analista I Sede/Outros usuarios
-/até 50 mil/baixo//x/
```
"""
from __future__ import annotations

import argparse
import csv
import html
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
from xml.etree import ElementTree as ET


NAMESPACES = {
    "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
    "activiti": "http://activiti.org/bpmn",
}

SAFE_GLOBALS = {"__builtins__": {}}


@dataclass
class ScriptExpression:
    """Representa uma expressão definida dentro de um ``scriptTask``."""

    variable: str
    expression: str
    compiled: object


@dataclass
class SequenceFlow:
    """Ligação dirigida entre dois elementos do processo."""

    flow_id: str
    source: str
    target: str
    condition: Optional[object]


@dataclass
class Node:
    """Elemento relevante do processo BPMN."""

    node_id: str
    tag: str
    name: str
    category: Optional[str] = None
    candidate_groups: Optional[str] = None

    @property
    def type(self) -> str:
        return self.tag.split("}")[-1]


class BpmnDefinition:
    """Representa o subconjunto do BPMN necessário para as simulações."""

    def __init__(
        self,
        nodes: Dict[str, Node],
        flows: Dict[str, SequenceFlow],
        flows_by_source: Dict[str, List[SequenceFlow]],
        gateway_defaults: Dict[str, str],
        script_expressions: Sequence[ScriptExpression],
        start_event: str,
        end_events: Sequence[str],
    ) -> None:
        self.nodes = nodes
        self.flows = flows
        self.flows_by_source = flows_by_source
        self.gateway_defaults = gateway_defaults
        self.script_expressions = script_expressions
        self.start_event = start_event
        self.end_events = set(end_events)


def js_to_python_expression(js_code: str) -> str:
    """Converte uma expressão javascript (com HTML entities) para Python."""

    text = html.unescape(js_code.strip())
    text = text.replace("&&", " and ").replace("||", " or ")
    text = text.replace("===", "==").replace("!==", "!=")
    # Substitui o operador "!" por "not" quando não fizer parte de "!="
    text = re.sub(r"!\s*(?=[A-Za-z_\(])", "not ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def parse_script_expressions(script_text: str) -> List[ScriptExpression]:
    """Extrai e compila as expressões de ``execution.setVariable``."""

    pattern = re.compile(
        r'execution\.setVariable\("(?P<var>[^"]+)",\s*(?P<expr>.*?)\);',
        re.DOTALL,
    )
    expressions: List[ScriptExpression] = []
    for match in pattern.finditer(script_text):
        variable = match.group("var")
        raw_expr = match.group("expr").strip()
        py_expr = js_to_python_expression(raw_expr)
        compiled = compile(py_expr, f"<script:{variable}>", "eval")
        expressions.append(ScriptExpression(variable, py_expr, compiled))
    return expressions


def parse_condition_expression(text: Optional[str], *, flow_id: str) -> Optional[object]:
    if not text:
        return None
    cleaned = text.strip()
    if cleaned.startswith("${") and cleaned.endswith("}"):
        cleaned = cleaned[2:-1]
        cleaned = cleaned.strip()
    py_expr = js_to_python_expression(cleaned)
    return compile(py_expr, f"<condition:{flow_id}>", "eval")


def load_bpmn_definition(path: Path) -> BpmnDefinition:
    tree = ET.parse(path)
    root = tree.getroot()

    nodes: Dict[str, Node] = {}
    flows: Dict[str, SequenceFlow] = {}
    flows_by_source: Dict[str, List[SequenceFlow]] = {}
    gateway_defaults: Dict[str, str] = {}
    script_expressions: List[ScriptExpression] = []
    start_events: List[str] = []
    end_events: List[str] = []

    for elem in root.findall(".//bpmn:process/*", NAMESPACES):
        tag = elem.tag
        node_id = elem.get("id")
        if not node_id:
            continue
        if tag.endswith("startEvent"):
            start_events.append(node_id)
        if tag.endswith("endEvent"):
            end_events.append(node_id)
        if tag.endswith("exclusiveGateway"):
            default_flow = elem.get("default")
            if default_flow:
                gateway_defaults[node_id] = default_flow
        if tag.endswith("scriptTask"):
            script_node = elem.find("bpmn:script", NAMESPACES)
            if script_node is not None and script_node.text:
                script_expressions.extend(parse_script_expressions(script_node.text))
        if tag.endswith("sequenceFlow"):
            continue
        nodes[node_id] = Node(
            node_id=node_id,
            tag=tag,
            name=elem.get("name", ""),
            category=elem.get(f"{{{NAMESPACES['activiti']}}}category"),
            candidate_groups=elem.get(f"{{{NAMESPACES['activiti']}}}candidateGroups"),
        )

    for elem in root.findall(".//bpmn:sequenceFlow", NAMESPACES):
        flow_id = elem.get("id")
        source = elem.get("sourceRef")
        target = elem.get("targetRef")
        if not flow_id or not source or not target:
            continue
        condition_elem = elem.find("bpmn:conditionExpression", NAMESPACES)
        condition = parse_condition_expression(
            condition_elem.text if condition_elem is not None else None,
            flow_id=flow_id,
        )
        flow = SequenceFlow(flow_id, source, target, condition)
        flows[flow_id] = flow
        flows_by_source.setdefault(source, []).append(flow)

    if not start_events:
        raise ValueError("Nenhum startEvent encontrado no processo BPMN")

    return BpmnDefinition(
        nodes=nodes,
        flows=flows,
        flows_by_source=flows_by_source,
        gateway_defaults=gateway_defaults,
        script_expressions=script_expressions,
        start_event=start_events[0],
        end_events=end_events,
    )


def evaluate_script_variables(
    script_expressions: Sequence[ScriptExpression],
    context: Dict[str, object],
) -> None:
    for expression in script_expressions:
        try:
            value = eval(expression.compiled, SAFE_GLOBALS, context)
        except NameError:
            value = None
        context[expression.variable] = value


def evaluate_gateway(
    gateway_id: str,
    flows_by_source: Dict[str, List[SequenceFlow]],
    gateway_defaults: Dict[str, str],
    context: Dict[str, object],
) -> str:
    outgoing = flows_by_source.get(gateway_id, [])
    for flow in outgoing:
        if flow.condition is None:
            continue
        if eval(flow.condition, SAFE_GLOBALS, context):
            return flow.target
    default_flow_id = gateway_defaults.get(gateway_id)
    if default_flow_id:
        flow_index = [f.flow_id for f in outgoing].index(default_flow_id)
        return outgoing[flow_index].target
    if outgoing:
        return outgoing[-1].target
    raise ValueError(f"Gateway {gateway_id} sem fluxo de saída")


def simulate_case(definition: BpmnDefinition, valor_proposta: float, risco: str, aprovado: bool) -> List[str]:
    context: Dict[str, object] = {
        "valorProposta": valor_proposta,
        "risco": risco,
        "aprovado": aprovado,
    }
    evaluate_script_variables(definition.script_expressions, context)

    current = definition.start_event
    visited_tasks: List[str] = []

    while True:
        if current in definition.end_events:
            break
        node = definition.nodes.get(current)
        if node is None:
            # Elementos como anotações não aparecem em ``nodes``.
            flows = definition.flows_by_source.get(current, [])
            if not flows:
                break
            current = flows[0].target
            continue
        node_type = node.type
        if node_type == "startEvent":
            flows = definition.flows_by_source.get(current, [])
            if not flows:
                raise ValueError("startEvent sem fluxo de saída")
            current = flows[0].target
        elif node_type == "scriptTask":
            flows = definition.flows_by_source.get(current, [])
            if not flows:
                raise ValueError("scriptTask sem fluxo de saída")
            current = flows[0].target
        elif node_type == "userTask":
            visited_tasks.append(node.node_id)
            flows = definition.flows_by_source.get(current, [])
            if not flows:
                raise ValueError(f"userTask {node.node_id} sem fluxo de saída")
            current = flows[0].target
        elif node_type == "exclusiveGateway":
            current = evaluate_gateway(
                current,
                definition.flows_by_source,
                definition.gateway_defaults,
                context,
            )
        else:
            # Para outros tipos, apenas segue o primeiro fluxo.
            flows = definition.flows_by_source.get(current, [])
            if not flows:
                raise ValueError(f"Elemento {node.node_id} sem fluxo de saída")
            current = flows[0].target

    return visited_tasks


def classificar_por_coluna(task_ids: Iterable[str]) -> Dict[str, bool]:
    papeis = {
        "Assistente Sede": False,
        "Analista I Sede": False,
        "Outros usuarios": False,
    }
    for task_id in task_ids:
        if task_id == "usertask7":
            papeis["Assistente Sede"] = True
        if task_id in {"usertask1", "usertask8"}:
            papeis["Analista I Sede"] = True
        if task_id in {"usertask2", "usertask3", "usertask4", "usertask5"}:
            papeis["Outros usuarios"] = True
    return papeis


def gerar_planilha(definition: BpmnDefinition) -> List[List[str]]:
    intervalos: List[Tuple[str, float]] = [
        ("até 50 mil", 50_000),
        ("50 mil - 100 mil", 75_000),
        ("100 mil - 150 mil", 125_000),
        ("150 mil - 200 mil", 175_000),
        ("200 mil - 300 mil", 250_000),
        ("acima de 300 mil", 350_000),
    ]
    riscos: List[Tuple[str, str]] = [
        ("baixo", "BAIXO"),
        ("alto", "ALTO"),
        ("outros", "OUTRO"),
    ]

    linhas: List[List[str]] = []

    for risco_label, risco_valor in riscos:
        for intervalo_label, valor in intervalos:
            tasks = simulate_case(definition, valor, risco_valor, aprovado=True)
            papeis = classificar_por_coluna(tasks)
            linhas.append(
                [
                    "-",
                    intervalo_label,
                    risco_label,
                    "x" if papeis["Assistente Sede"] else "",
                    "x" if papeis["Analista I Sede"] else "",
                    "x" if papeis["Outros usuarios"] else "",
                ]
            )
    return linhas


def escrever_csv_saida(rows: Sequence[Sequence[str]], output_path: Path) -> None:
    header = [
        "valorEndividamento",
        "valorProposta",
        "RISCO",
        "Assistente Sede",
        "Analista I Sede",
        "Outros usuarios",
    ]
    with output_path.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile, delimiter="/")
        writer.writerow(header)
        for row in rows:
            writer.writerow(row)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bpmn", type=Path, help="Caminho para o arquivo BPMN de entrada")
    parser.add_argument(
        "output",
        type=Path,
        help="Arquivo de saída (CSV) gerado a partir do processo",
    )
    args = parser.parse_args(argv)

    definition = load_bpmn_definition(args.bpmn)
    rows = gerar_planilha(definition)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    escrever_csv_saida(rows, args.output)
    return 0


if __name__ == "__main__":  # pragma: no cover - execução direta
    raise SystemExit(main())
