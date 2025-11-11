import { describe, it, expect } from 'vitest';
import { generateApprovalMatrix, rowsToDelimitedContent } from '../utils/bpmnSpreadsheet';

const SAMPLE_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:activiti="http://activiti.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.activiti.org/test">
  <process id="FluxoCiviaCartaoCreditoLimiteCredito" name="FluxoCiviaCartaoCreditoLimiteCredito" isExecutable="true">
    <startEvent id="startevent1" name="Start"></startEvent>
    <endEvent id="endevent1" name="End"></endEvent>
    <scriptTask id="scripttask1" name="Inicializa Variáveis" scriptFormat="javascript" activiti:autoStoreVariables="false">
      <script>
// CONSTANTES
execution.setVariable("valorEndividamento", endividamentoTotal);
execution.setVariable("valorProposta", valorProposta);

// RISCO
execution.setVariable("naoTemRiscoBaixo",  (risco !== 'BAIXO'));
execution.setVariable("temRiscoBaixo",  (risco === 'BAIXO'));
execution.setVariable("temRiscoAlto",  (risco === 'ALTO'));

// ALÇADA
execution.setVariable("ehFaixaPropostaAteCinquentaMil", (valorProposta &lt;= 50000));
execution.setVariable("ehFaixaPropostaCinquentaMil_CemMil", (valorProposta &gt; 50000 &amp;&amp; valorProposta &lt;= 100000));
execution.setVariable("ehFaixaPropostaCemMil_CentoECinquentaMil", (valorProposta &gt; 100000 &amp;&amp; valorProposta &lt;= 150000));
execution.setVariable("ehFaixaPropostaCentoECinquentaMil_DuzentosMil", (valorProposta &gt; 150000 &amp;&amp; valorProposta &lt;= 200000));
execution.setVariable("ehFaixaPropostaDuzentosMil_TrezentosMil", (valorProposta &gt; 200000 &amp;&amp; valorProposta &lt;= 300000));
execution.setVariable("ehFaixaPropostaMaiorQueTrezentosMil", (valorProposta &gt; 300000));

</script>
    </scriptTask>
    <userTask id="usertask1" name="Assistente Sede ou Analista I Sede" activiti:candidateGroups="assistente.sede,analista.sede" activiti:category="Assistente Sede"></userTask>
    <exclusiveGateway id="exclusivegateway3" name="Exclusive Gateway" default="flow21"></exclusiveGateway>
    <sequenceFlow id="flow5" sourceRef="usertask1" targetRef="exclusivegateway3"></sequenceFlow>
    <userTask id="usertask2" name="Analista II Sede ou Supervisor Crédito ou Coordenador Sede" activiti:candidateGroups="analistapl.sede,supervisor.credito,coordenador.sede" activiti:category="Analista II Sede"></userTask>
    <sequenceFlow id="flow6" sourceRef="exclusivegateway3" targetRef="usertask2">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${ aprovado and (
    (ehFaixaPropostaCemMil_CentoECinquentaMil and naoTemRiscoBaixo) or
    ehFaixaPropostaCentoECinquentaMil_DuzentosMil or
    ehFaixaPropostaDuzentosMil_TrezentosMil or
    ehFaixaPropostaMaiorQueTrezentosMil
)}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow7" sourceRef="startevent1" targetRef="scripttask1"></sequenceFlow>
    <userTask id="usertask3" name="Gerente Regional" activiti:candidateGroups="gerente.pa" activiti:category="Gerente Regional"></userTask>
    <userTask id="usertask4" name="Gerente Sede" activiti:candidateGroups="gerente.sede" activiti:category="Gerente Sede"></userTask>
    <exclusiveGateway id="exclusivegateway6" name="Exclusive Gateway" default="flow18"></exclusiveGateway>
    <sequenceFlow id="flow12" sourceRef="usertask4" targetRef="exclusivegateway6"></sequenceFlow>
    <userTask id="usertask5" name="Diretor Sede ou Diretor Executivo" activiti:candidateGroups="diretor.sede,executivo.sede" activiti:category="Diretoria">
      <extensionElements>
        <activiti:formProperty id="CIENTE" default="true"></activiti:formProperty>
      </extensionElements>
    </userTask>
    <sequenceFlow id="flow13" sourceRef="exclusivegateway6" targetRef="usertask5">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${ aprovado and
 ( ehFaixaPropostaCentoECinquentaMil_DuzentosMil and temRiscoAlto) or
    ehFaixaPropostaDuzentosMil_TrezentosMil or
    ehFaixaPropostaMaiorQueTrezentosMil
}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow18" sourceRef="exclusivegateway6" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow21" sourceRef="exclusivegateway3" targetRef="endevent1"></sequenceFlow>
    <exclusiveGateway id="exclusivegateway10" name="Exclusive Gateway" default="flow33"></exclusiveGateway>
    <sequenceFlow id="flow29" sourceRef="scripttask1" targetRef="exclusivegateway10"></sequenceFlow>
    <userTask id="usertask7" name="Assistente Sede" activiti:candidateGroups="assistente.sede" activiti:category="Assistente Sede"></userTask>
    <sequenceFlow id="flow32" sourceRef="exclusivegateway10" targetRef="usertask7">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${ ehFaixaPropostaCinquentaMil_CemMil or (
ehFaixaPropostaCemMil_CentoECinquentaMil and temRiscoBaixo
)}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow33" sourceRef="exclusivegateway10" targetRef="usertask1"></sequenceFlow>
    <exclusiveGateway id="exclusivegateway11" name="Exclusive Gateway" default="flow39"></exclusiveGateway>
    <sequenceFlow id="flow34" sourceRef="usertask7" targetRef="exclusivegateway11"></sequenceFlow>
    <userTask id="usertask8" name="Analista I Sede" activiti:candidateGroups="analista.sede" activiti:category="Analista I Sede"></userTask>
    <sequenceFlow id="flow35" sourceRef="exclusivegateway11" targetRef="usertask8">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${aprovado}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow39" sourceRef="exclusivegateway11" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow41" sourceRef="usertask5" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow44" sourceRef="usertask8" targetRef="endevent1"></sequenceFlow>
    <exclusiveGateway id="exclusivegateway12" name="Exclusive Gateway" default="flow48"></exclusiveGateway>
    <sequenceFlow id="flow45" sourceRef="usertask2" targetRef="exclusivegateway12"></sequenceFlow>
    <sequenceFlow id="flow46" sourceRef="exclusivegateway12" targetRef="usertask3">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${ aprovado and (
(ehFaixaPropostaCemMil_CentoECinquentaMil and temRiscoAlto) or
    ehFaixaPropostaDuzentosMil_TrezentosMil or
    ehFaixaPropostaMaiorQueTrezentosMil
)}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow47" sourceRef="exclusivegateway12" targetRef="usertask4">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${ aprovado and
    ehFaixaPropostaCentoECinquentaMil_DuzentosMil
}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow48" sourceRef="exclusivegateway12" targetRef="endevent1"></sequenceFlow>
    <exclusiveGateway id="exclusivegateway13" name="Exclusive Gateway" default="flow51"></exclusiveGateway>
    <sequenceFlow id="flow49" sourceRef="usertask3" targetRef="exclusivegateway13"></sequenceFlow>
    <sequenceFlow id="flow50" sourceRef="exclusivegateway13" targetRef="usertask4">
      <conditionExpression xsi:type="tFormalExpression">@[CDATA[\${ aprovado and
    ehFaixaPropostaDuzentosMil_TrezentosMil or
    ehFaixaPropostaMaiorQueTrezentosMil
}]]</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow51" sourceRef="exclusivegateway13" targetRef="endevent1"></sequenceFlow>
  </process>
</definitions>`;

describe('generateApprovalMatrix', () => {
  it('gera linhas para todas as combinações de risco e faixa de proposta', () => {
    const rows = generateApprovalMatrix(SAMPLE_BPMN);
    expect(rows).toHaveLength(18);

    const baixoAte50 = rows.find(
      (row) => row.valorProposta === 'até 50 mil' && row.risco === 'baixo'
    );
    expect(baixoAte50).toBeDefined();
    expect(baixoAte50?.assistenteSede).toBe('x');
    expect(baixoAte50?.analistaISede).toBe('x');
    expect(baixoAte50?.outrosUsuarios).toBe('');

    const medioCemCentoeCinquenta = rows.find(
      (row) => row.valorProposta === '100 a 150 mil' && row.risco === 'médio'
    );
    expect(medioCemCentoeCinquenta?.outrosUsuarios).toBe('x');

    const altoCentoCinquentaDuzentos = rows.find(
      (row) => row.valorProposta === '150 a 200 mil' && row.risco === 'alto'
    );
    expect(altoCentoCinquentaDuzentos?.assistenteSede).toBe('x');
    expect(altoCentoCinquentaDuzentos?.analistaISede).toBe('x');
    expect(altoCentoCinquentaDuzentos?.outrosUsuarios).toBe('x');
  });

  it('gera conteúdo delimitado com cabeçalho', () => {
    const rows = generateApprovalMatrix(SAMPLE_BPMN);
    const content = rowsToDelimitedContent(rows, '/');
    const lines = content.split('\n');
    expect(lines[0]).toBe(
      'valorEndividamento/valorProposta/RISCO/Assistente Sede/Analista I Sede/Outros usuarios'
    );
    expect(lines[1]).toContain('até 50 mil');
  });
});
