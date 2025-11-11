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

const CENTRALIZACAO_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:activiti="http://activiti.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.activiti.org/test">
  <process id="FluxoCiviaCentralizacao" name="FluxoCiviaCentralizacao" isExecutable="true">
    <startEvent id="startevent1" name="Start"></startEvent>
    <scriptTask id="scripttask1" name="Inicializa Varíaveis" scriptFormat="javascript" activiti:autoStoreVariables="false">
      <script>execution.setVariable("valorEndividamento", endividamentoTotal);
execution.setVariable("valorProposta", valorProposta);

execution.setVariable("ehFaixaEndividamentoZero_CinquentaMil", (valorEndividamento &gt; 0 &amp;&amp; valorEndividamento &lt;= 50000));
execution.setVariable("ehFaixaEndividamentoCinquentaMil_CemMil", (valorEndividamento &gt; 50000 &amp;&amp; valorEndividamento &lt;= 100000));
execution.setVariable("ehFaixaEndividamentoCemMil_CentoECinquentaMil", (valorEndividamento &gt; 100000 &amp;&amp; valorEndividamento &lt;= 150000));
execution.setVariable("ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil", (valorEndividamento &gt; 150000 &amp;&amp; valorEndividamento &lt;= 200000));
execution.setVariable("ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil", (valorEndividamento &gt; 200000 &amp;&amp; valorEndividamento &lt;= 250000));
execution.setVariable("ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil", (valorEndividamento &gt; 250000 &amp;&amp; valorEndividamento &lt;= 300000));
execution.setVariable("ehFaixaEndividamentoMaiorQueTrezentosMil", (valorEndividamento &gt; 300000));

execution.setVariable("ehFaixaPropostaCinquentaMil_CemMil", (valorProposta &gt; 50000 &amp;&amp; valorProposta &lt;= 100000));
execution.setVariable("ehFaixaPropostaZero_CinquentaMil", (valorProposta &lt;= 50000));
execution.setVariable("ehFaixaPropostaCinquentaMil_CentoECinquentaMil", (valorProposta &gt; 50000 &amp;&amp; valorProposta &lt;= 150000));
execution.setVariable("ehFaixaPropostaCinquentaMil_DuzentosMil", (valorProposta &gt; 50000 &amp;&amp; valorProposta &lt;= 200000));
execution.setVariable("ehFaixaPropostaCentoECinquentaMil_DuzentosECinquentaMil", (valorProposta &gt; 150000 &amp;&amp; valorProposta &lt;= 250000));
execution.setVariable("ehFaixaPropostaCentoECinquentaMil_TrezentosMil", (valorProposta &gt; 150000 &amp;&amp; valorProposta &lt;= 300000));
execution.setVariable("ehFaixaPropostaCinquentaMil_TrezentosMil", (valorProposta &gt; 50000 &amp;&amp; valorProposta &lt;= 300000));
execution.setVariable("ehFaixaPropostaMaiorQueTrezentosMil", (valorProposta &gt; 300000));

execution.setVariable("ehFaixaPropostaZero_DuzentosECinquentaMil", (valorProposta &lt;= 250000));
execution.setVariable("ehFaixaPropostaZero_TrezentosMil", (valorProposta &lt;= 300000));


execution.setVariable("temScoreAlto", (risco === 'ALTO'));
execution.setVariable("naoTemScoreAlto", (risco !== 'ALTO') );
execution.setVariable("naoTemScoreBaixo", (risco !== 'BAIXO'));</script>
    </scriptTask>
    <sequenceFlow id="flow1" sourceRef="startevent1" targetRef="scripttask1"></sequenceFlow>
    <exclusiveGateway id="exclusivegateway1" name="Exclusive Gateway" default="flow55"></exclusiveGateway>
    <userTask id="usertask1" name="Gerente Relacionamento PA" activiti:candidateGroups="coordenador.pa" activiti:category="Coordenador"></userTask>
    <userTask id="usertask2" name="Assistente Sede ou Analista I Sede" activiti:candidateGroups="assistente.sede,analista.sede" activiti:category="Assistente Sede"></userTask>
    <endEvent id="endevent1" name="End"></endEvent>
    <exclusiveGateway id="exclusivegateway5" name="Exclusive Gateway" default="flow23"></exclusiveGateway>
    <userTask id="usertask5" name="Gerente Regional" activiti:candidateGroups="gerente.pa" activiti:category="Gerente Regional"></userTask>
    <sequenceFlow id="flow14" sourceRef="exclusivegateway5" targetRef="usertask5">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${ aprovado and 
((ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaCentoECinquentaMil_DuzentosECinquentaMil) or
(ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCentoECinquentaMil_TrezentosMil) or
(ehFaixaEndividamentoMaiorQueTrezentosMil and ehFaixaPropostaCinquentaMil_TrezentosMil) or
(ehFaixaEndividamentoMaiorQueTrezentosMil and ehFaixaPropostaMaiorQueTrezentosMil)
)}]]></conditionExpression>
    </sequenceFlow>
    <exclusiveGateway id="exclusivegateway6" name="Exclusive Gateway" default="flow24"></exclusiveGateway>
    <sequenceFlow id="flow15" sourceRef="usertask5" targetRef="exclusivegateway6"></sequenceFlow>
    <userTask id="usertask6" name="Gerente Sede" activiti:candidateGroups="gerente.sede" activiti:category="Gerente Sede"></userTask>
    <sequenceFlow id="flow16" sourceRef="exclusivegateway6" targetRef="usertask6">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${aprovado}]]></conditionExpression>
    </sequenceFlow>
    <exclusiveGateway id="exclusivegateway7" name="Exclusive Gateway" default="flow25"></exclusiveGateway>
    <sequenceFlow id="flow17" sourceRef="usertask6" targetRef="exclusivegateway7"></sequenceFlow>
    <userTask id="usertask7" name="Diretor Sede ou Diretor Executivo" activiti:candidateGroups="diretor.sede,executivo.sede" activiti:category="Diretoria">
      <extensionElements>
        <activiti:formProperty id="CIENTE" default="true"></activiti:formProperty>
      </extensionElements>
    </userTask>
    <sequenceFlow id="flow18" sourceRef="exclusivegateway7" targetRef="usertask7">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${ aprovado and (
(ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCentoECinquentaMil_TrezentosMil) or
( ehFaixaEndividamentoMaiorQueTrezentosMil and ehFaixaPropostaCinquentaMil_TrezentosMil) or
(ehFaixaEndividamentoMaiorQueTrezentosMil and ehFaixaPropostaMaiorQueTrezentosMil)
)}]]></conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow23" sourceRef="exclusivegateway5" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow24" sourceRef="exclusivegateway6" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow25" sourceRef="exclusivegateway7" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow29" sourceRef="exclusivegateway5" targetRef="usertask6">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${ aprovado and ( ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaCinquentaMil_DuzentosMil and naoTemScoreBaixo) or
    ( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil) or
    ( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaZero_CinquentaMil and temScoreAlto ) or
    ( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil) or
    ( ehFaixaEndividamentoMaiorQueTrezentosMil and ehFaixaPropostaZero_CinquentaMil)
}]]></conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow30" sourceRef="usertask7" targetRef="endevent1"></sequenceFlow>
    <userTask id="usertask8" name="Assistente Sede" activiti:candidateGroups="assistente.sede" activiti:category="Assistente Sede"></userTask>
    <exclusiveGateway id="exclusivegateway8" name="Exclusive Gateway" default="flow38"></exclusiveGateway>
    <sequenceFlow id="flow32" sourceRef="usertask8" targetRef="exclusivegateway8"></sequenceFlow>
    <sequenceFlow id="flow38" sourceRef="exclusivegateway8" targetRef="endevent1"></sequenceFlow>
    <userTask id="usertask10" name="Analista I Sede" activiti:candidateGroups="analista.sede" activiti:category="Analista I Sede"></userTask>
    <sequenceFlow id="flow40" sourceRef="exclusivegateway8" targetRef="usertask10">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${aprovado}]]></conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow43" sourceRef="usertask10" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow44" sourceRef="exclusivegateway1" targetRef="usertask8">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${
(ehFaixaEndividamentoCemMil_CentoECinquentaMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil and naoTemScoreAlto)
or ( ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaZero_CinquentaMil and naoTemScoreAlto)
}]]></conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow46" sourceRef="exclusivegateway1" targetRef="usertask1">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${ (ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaCinquentaMil_DuzentosMil ) or
( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil ) or
( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaCentoECinquentaMil_DuzentosECinquentaMil) or

( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil) or
( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCentoECinquentaMil_TrezentosMil ) or 

(ehFaixaEndividamentoMaiorQueTrezentosMil)

}]]></conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow47" sourceRef="exclusivegateway1" targetRef="usertask2">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${
( ehFaixaEndividamentoZero_CinquentaMil and ehFaixaPropostaZero_CinquentaMil) or
( ehFaixaEndividamentoCinquentaMil_CemMil and ehFaixaPropostaZero_CinquentaMil) or
( ehFaixaEndividamentoCinquentaMil_CemMil and ehFaixaPropostaCinquentaMil_CemMil) or

( ehFaixaEndividamentoCemMil_CentoECinquentaMil and ehFaixaPropostaZero_CinquentaMil) or
( ehFaixaEndividamentoCemMil_CentoECinquentaMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil and temScoreAlto) or

( ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaZero_CinquentaMil and temScoreAlto) or

( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaZero_CinquentaMil) or

( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaZero_CinquentaMil)
}]]></conditionExpression>
    </sequenceFlow>
    <userTask id="usertask11" name="Analista II Sede ou Supervisor Crédito ou Coordenador Sede" activiti:candidateGroups="analistapl.sede,supervisor.credito,coordenador.sede" activiti:category="Analista II Sede"></userTask>
    <sequenceFlow id="flow50" sourceRef="exclusivegateway11" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow54" sourceRef="usertask11" targetRef="exclusivegateway5"></sequenceFlow>
    <sequenceFlow id="flow55" sourceRef="exclusivegateway1" targetRef="endevent1"></sequenceFlow>
    <sequenceFlow id="flow56" sourceRef="scripttask1" targetRef="exclusivegateway1"></sequenceFlow>
    <exclusiveGateway id="exclusivegateway11" name="Exclusive Gateway" default="flow50"></exclusiveGateway>
    <sequenceFlow id="flow57" sourceRef="usertask2" targetRef="exclusivegateway11"></sequenceFlow>
    <sequenceFlow id="flow60" sourceRef="exclusivegateway11" targetRef="usertask11">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${ aprovado and (
( ehFaixaEndividamentoCemMil_CentoECinquentaMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil and temScoreAlto) or

( ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaZero_CinquentaMil and temScoreAlto) or
( ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaCinquentaMil_DuzentosMil) or

( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaZero_DuzentosECinquentaMil) or

( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaZero_TrezentosMil) or
(ehFaixaEndividamentoMaiorQueTrezentosMil)
)}]]></conditionExpression>
    </sequenceFlow>
    <exclusiveGateway id="exclusivegateway12" name="Exclusive Gateway" default="flow63"></exclusiveGateway>
    <sequenceFlow id="flow61" sourceRef="usertask1" targetRef="exclusivegateway12"></sequenceFlow>
    <sequenceFlow id="flow62" sourceRef="exclusivegateway12" targetRef="usertask2">
      <conditionExpression xsi:type="tFormalExpression"><![CDATA[\${ aprovado and ( 
 (ehFaixaEndividamentoCentoECinquentaMil_DuzentosMil and ehFaixaPropostaCinquentaMil_DuzentosMil ) or
( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil ) or
( ehFaixaEndividamentoDuzentosMil_DuzentosECinquentaMil and ehFaixaPropostaCentoECinquentaMil_DuzentosECinquentaMil) or
( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCinquentaMil_CentoECinquentaMil) or
( ehFaixaEndividamentoDuzentosECinquentaMil_TrezentosMil and ehFaixaPropostaCentoECinquentaMil_TrezentosMil ) or 
(ehFaixaEndividamentoMaiorQueTrezentosMil)
)}]]></conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow63" sourceRef="exclusivegateway12" targetRef="endevent1"></sequenceFlow>
    <textAnnotation id="textannotation1">
      <text> FLUXO CENTRALIZAÇÃO - CIVIA
 EMPRÉSTIMO, RENEGOCIAÇÃO FACILITADA, FLUXO ATRASO(EMPRÉSTIMO E RENEGOCIAÇÃO FACILITADA), 
LIMITE DESCONTO DE CHEQUE, LIMITE DESCONTO DE TÍTULO E 
LINHAS DE CRÉDITO: APLICAÇÃO: 200, 262, 275, 328 - COTAS: 199, 264, 285, 326  </text>
    </textAnnotation>
  </process>
</definitions>`;

describe('generateApprovalMatrix', () => {
  it('gera linhas para todas as combinações de risco e faixa de proposta', () => {
    const rows = generateApprovalMatrix(SAMPLE_BPMN);
    expect(rows).toHaveLength(18);

    const baixoAte50 = rows.find(
      (row) => row.valorEndividamento === 'até 50 mil' && row.score === 'Baixo'
    );
    expect(baixoAte50).toBeDefined();
    expect(baixoAte50?.valorProposta).toBe('40000');
    expect(baixoAte50?.assistenteSRO).toBe('x');
    expect(baixoAte50?.analistaISede).toBe('x');
    expect(baixoAte50?.sequenceGroupByColumn.assistenteSRO).toBe(
      baixoAte50?.sequenceGroupByColumn.analistaISede
    );
    expect(baixoAte50?.diretorSede).toBe('');

    const medioCemCentoeCinquenta = rows.find(
      (row) => row.valorEndividamento === '100 a 150 mil' && row.score === 'Médio'
    );
    expect(medioCemCentoeCinquenta?.analistaIISede).toBe('x');
    expect(typeof medioCemCentoeCinquenta?.sequenceGroupByColumn.analistaIISede).toBe(
      'number'
    );

    const altoCentoCinquentaDuzentos = rows.find(
      (row) => row.valorEndividamento === '150 a 200 mil' && row.score === 'Alto'
    );
    expect(altoCentoCinquentaDuzentos?.assistenteSRO).toBe('x');
    expect(altoCentoCinquentaDuzentos?.analistaISede).toBe('x');
    expect(altoCentoCinquentaDuzentos?.diretorExecutivo).toBe('x');
    expect(
      altoCentoCinquentaDuzentos?.sequenceGroupByColumn.assistenteSRO
    ).toBe(altoCentoCinquentaDuzentos?.sequenceGroupByColumn.analistaISede);
    expect(
      altoCentoCinquentaDuzentos?.sequenceGroupByColumn.analistaIISede
    ).toBe(altoCentoCinquentaDuzentos?.sequenceGroupByColumn.coordenadorSede);
    expect(
      altoCentoCinquentaDuzentos?.sequenceGroupByColumn.supervisorCredito
    ).toBe(altoCentoCinquentaDuzentos?.sequenceGroupByColumn.analistaIISede);
    expect(
      altoCentoCinquentaDuzentos?.sequenceGroupByColumn.diretorExecutivo
    ).toBe(altoCentoCinquentaDuzentos?.sequenceGroupByColumn.diretorSede);
  });

  it('gera conteúdo delimitado com cabeçalho', () => {
    const rows = generateApprovalMatrix(SAMPLE_BPMN);
    const content = rowsToDelimitedContent(rows);
    const lines = content.split('\n');
    expect(lines[0]).toBe(
      'Valor de Endividamento,Valor da Proposta,Score,Assistente PA,Consultor PA,Gerente Relacionamento PA,Assistente SRO,Analista I Sede,Analista II Sede,Supervisor Crédito,Coordenador Sede,Gerente Regional,Gerente Sede,Superintendente,Diretor Sede,Diretor Executivo'
    );
    expect(lines[1]).toContain('até 50 mil');
    expect(lines[1]).toContain('40000');
    expect(content).not.toContain('*');
  });

  it('suporta scripts com variáveis de proposta e endividamento estendidas', () => {
    const rows = generateApprovalMatrix(CENTRALIZACAO_BPMN);
    const linhaAltoAcimaTrezentos = rows.find(
      (row) => row.valorEndividamento === 'acima de 300 mil' && row.score === 'Alto'
    );

    expect(linhaAltoAcimaTrezentos).toBeDefined();
    expect(linhaAltoAcimaTrezentos?.gerenteRelacionamentoPA).toBe('x');
    expect(linhaAltoAcimaTrezentos?.assistenteSRO).toBe('x');
    expect(linhaAltoAcimaTrezentos?.analistaISede).toBe('x');
    expect(linhaAltoAcimaTrezentos?.analistaIISede).toBe('x');
    expect(linhaAltoAcimaTrezentos?.supervisorCredito).toBe('x');
    expect(linhaAltoAcimaTrezentos?.coordenadorSede).toBe('x');
    expect(linhaAltoAcimaTrezentos?.gerenteRegional).toBe('x');
    expect(linhaAltoAcimaTrezentos?.gerenteSede).toBe('x');
    expect(linhaAltoAcimaTrezentos?.diretorSede).toBe('x');
    expect(linhaAltoAcimaTrezentos?.diretorExecutivo).toBe('x');
  });
});
