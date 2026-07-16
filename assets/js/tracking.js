/* ============================================================
   Partner Certificadora Digital — camada única de rastreamento
   ------------------------------------------------------------
   Google Tag ID....: GT-5RMBRRZC   (carregado no <head> de cada página)
   Destino Google Ads: AW-18327593171

   O carregamento do gtag.js fica no <head> de cada página, conforme o
   padrão oficial do Google. Este arquivo NÃO carrega a tag: ele concentra
   apenas os eventos e as conversões, para não haver código espalhado.

   Para ativar uma conversão do Google Ads, basta preencher o rótulo
   correspondente no objeto CONVERSOES abaixo. Nenhum outro arquivo
   precisa ser alterado.
   ============================================================ */
(function (window, document) {
  'use strict';

  var ADS_ID = 'AW-18327593171';

  /* Rótulos de conversão do Google Ads.
     Onde encontrar: Google Ads > Objetivos > Conversões > (ação) >
     instruções da tag > trecho send_to: 'AW-18327593171/ROTULO'.
     Aceita os dois formatos: o send_to completo ('AW-18327593171/ROTULO')
     ou apenas o rótulo ('ROTULO').
     Enquanto o valor for null, a interação é enviada como evento comum
     (visível no Tag Assistant), mas não é contada como conversão. */
  var CONVERSOES = {
    lead_form_submit: 'AW-18327593171/3GG_CPKLzdEcENPBo6NE', // envio de formulário
    whatsapp_click:   null, // clique no WhatsApp
    telefone_click:   null, // clique em telefone
    conversao_cta:    null  // demais CTAs (âncoras para o formulário)
  };

  function nomePagina() {
    return document.title.slice(0, 60);
  }

  /* Envia a interação para o dataLayer e para o gtag, e — se houver rótulo
     cadastrado — dispara também a conversão do Google Ads. */
  function enviar(evento, params) {
    params = params || {};
    if (!params.cta_pagina) params.cta_pagina = nomePagina();

    var registro = { event: evento };
    for (var chave in params) {
      if (Object.prototype.hasOwnProperty.call(params, chave)) registro[chave] = params[chave];
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(registro);

    if (typeof window.gtag !== 'function') return;

    window.gtag('event', evento, params);

    var rotulo = CONVERSOES[evento];
    if (rotulo) {
      // Aceita o send_to completo ou só o rótulo, sem duplicar o ID da conta.
      var destino = rotulo.indexOf('/') !== -1 ? rotulo : ADS_ID + '/' + rotulo;
      window.gtag('event', 'conversion', { send_to: destino });
    }
  }

  /* API pública usada pelos formulários das páginas. */
  window.PartnerTrack = {
    evento: enviar,
    lead: function (formId) { enviar('lead_form_submit', { form_id: formId }); },
    cta: function (ctaId) { enviar('conversao_cta', { cta_id: ctaId }); }
  };

  function ehWhatsApp(el, ctaId) {
    if (ctaId && ctaId.indexOf('whatsapp') === 0) return true;
    var href = el.getAttribute('href') || '';
    return href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1;
  }

  function ligar() {
    /* CTAs marcados com data-conversion (WhatsApp flutuante, âncoras, etc.) */
    document.querySelectorAll('[data-conversion]').forEach(function (el) {
      // O botão de submit é contabilizado no envio do formulário, não no clique.
      if (el.tagName === 'BUTTON' && el.type === 'submit') return;
      el.addEventListener('click', function () {
        var ctaId = this.getAttribute('data-conversion');
        enviar(ehWhatsApp(this, ctaId) ? 'whatsapp_click' : 'conversao_cta', { cta_id: ctaId });
      });
    });

    /* Cliques em telefone. O guard evita contagem dupla caso o link
       também tenha data-conversion. */
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
      if (el.hasAttribute('data-conversion')) return;
      el.addEventListener('click', function () {
        enviar('telefone_click', { telefone: (this.getAttribute('href') || '').replace('tel:', '') });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ligar);
  } else {
    ligar();
  }
})(window, document);
