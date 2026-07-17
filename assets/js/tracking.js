/* ============================================================
   Partner Certificadora Digital — camada única de rastreamento
   ------------------------------------------------------------
   Google Tag ID....: GT-5RMBRRZC   (carregado no <head> de cada página)
   Destino Google Ads: AW-18327593171
   Meta Pixel ID.....: 2080538082501495  (carregado por este arquivo)

   O gtag.js é carregado no <head> de cada página (padrão oficial do Google).
   O Meta Pixel é carregado por ESTE arquivo, de forma centralizada, para não
   precisar editar as 11 páginas. Aqui também ficam todos os eventos e
   conversões, evitando código espalhado.

   Para ativar uma conversão do Google Ads, basta preencher o rótulo
   correspondente no objeto CONVERSOES abaixo.
   ============================================================ */
(function (window, document) {
  'use strict';

  var ADS_ID = 'AW-18327593171';
  var META_PIXEL_ID = '2080538082501495';

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

  /* Meta Pixel: mapeia os eventos internos para os eventos padrão do Pixel. */
  var META_EVENTOS = {
    whatsapp_click:   'Contact', // clique no WhatsApp
    lead_form_submit: 'Lead'     // formulário enviado com sucesso
  };

  /* ViewContent só nas páginas comerciais (home, produtos, contadores e
     "como funciona"). Fora dessa lista — jurídicas, institucionais, FAQ —
     dispara apenas PageView. */
  var VIEWCONTENT_PAGINAS = [
    'index.html',
    'certificado-digital-e-cpf-a1.html',
    'certificado-digital-e-cnpj-a1.html',
    'certificado-digital-para-contadores.html',
    'como-funciona.html'
  ];

  function paginaAtual() {
    var p = window.location.pathname;
    if (p === '' || p === '/') return 'index.html';
    return p.substring(p.lastIndexOf('/') + 1) || 'index.html';
  }

  /* Carrega o snippet base do Meta Pixel (uma única vez) e dispara os
     eventos de carregamento de página. PageView em todas; ViewContent
     apenas nas páginas listadas em VIEWCONTENT_PAGINAS. */
  function carregarMetaPixel() {
    if (window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    if (VIEWCONTENT_PAGINAS.indexOf(paginaAtual()) !== -1) {
      window.fbq('track', 'ViewContent');
    }
  }

  function metaTrack(nomeMeta) {
    if (typeof window.fbq === 'function') window.fbq('track', nomeMeta);
  }

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

    // Meta Pixel: disparado antes do gtag para acontecer o quanto antes,
    // ainda dentro do clique (relevante quando o link do WhatsApp navega
    // na mesma aba — o fbq usa sendBeacon e sobrevive à navegação).
    if (META_EVENTOS[evento]) metaTrack(META_EVENTOS[evento]);

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

  // Carrega o Pixel imediatamente (PageView + ViewContent), sem esperar o DOM.
  carregarMetaPixel();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ligar);
  } else {
    ligar();
  }
})(window, document);
