/* ============================================================
   Partner Certificadora Digital — camada única de rastreamento
   ------------------------------------------------------------
   Google Tag ID.....: GT-5RMBRRZC
   Google Ads........: AW-18327593171
   Meta Pixel........: 2080538082501495

   Eventos Google:
   - lead_form_submit
   - whatsapp_click
   - telefone_click
   - email_click
   - conversao_cta

   Eventos Meta:
   - PageView
   - ViewContent
   - Contact
   - Lead
   - CTA_Click (personalizado)
   ============================================================ */
(function (window, document) {
  'use strict';

  var ADS_ID = 'AW-18327593171';
  var META_PIXEL_ID = '2080538082501495';

  var CONVERSOES = {
    lead_form_submit: 'AW-18327593171/3GG_CPKLzdEcENPBo6NE',
    whatsapp_click: null,
    telefone_click: null,
    email_click: null,
    conversao_cta: null
  };

  function nomePagina() {
    return (document.title || 'Partner Certificadora Digital').slice(0, 100);
  }

  function caminhoPagina() {
    return window.location.pathname || '/';
  }

  function carregarMetaPixel() {
    if (window.fbq) return;

    /* Código-base oficial do Meta Pixel, carregado uma única vez. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    window.fbq('track', 'ViewContent', {
      content_name: nomePagina(),
      content_category: 'Certificado Digital',
      content_ids: [caminhoPagina()],
      content_type: 'product'
    });
  }

  function metaTrack(nome, params, personalizado) {
    if (typeof window.fbq !== 'function') return;
    if (personalizado) {
      window.fbq('trackCustom', nome, params || {});
    } else {
      window.fbq('track', nome, params || {});
    }
  }

  function enviarGoogle(evento, params) {
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
      var destino = rotulo.indexOf('/') !== -1 ? rotulo : ADS_ID + '/' + rotulo;
      window.gtag('event', 'conversion', { send_to: destino });
    }
  }

  function enviar(evento, params) {
    params = params || {};
    enviarGoogle(evento, params);

    switch (evento) {
      case 'lead_form_submit':
        metaTrack('Lead', {
          content_name: 'Formulário de contato',
          form_id: params.form_id || '',
          page_title: nomePagina()
        });
        break;
      case 'whatsapp_click':
        metaTrack('Contact', {
          contact_method: 'whatsapp',
          cta_id: params.cta_id || '',
          page_title: nomePagina()
        });
        break;
      case 'telefone_click':
        metaTrack('Contact', {
          contact_method: 'telefone',
          phone: params.telefone || '',
          page_title: nomePagina()
        });
        break;
      case 'email_click':
        metaTrack('Contact', {
          contact_method: 'email',
          email: params.email || '',
          page_title: nomePagina()
        });
        break;
      case 'conversao_cta':
        metaTrack('CTA_Click', {
          cta_id: params.cta_id || '',
          page_title: nomePagina(),
          page_path: caminhoPagina()
        }, true);
        break;
    }
  }

  window.PartnerTrack = {
    evento: enviar,
    lead: function (formId) {
      enviar('lead_form_submit', { form_id: formId || 'form-lead' });
    },
    cta: function (ctaId) {
      enviar('conversao_cta', { cta_id: ctaId || 'cta' });
    }
  };

  function ehWhatsApp(href, ctaId) {
    return (ctaId && ctaId.indexOf('whatsapp') === 0) ||
      href.indexOf('wa.me') !== -1 ||
      href.indexOf('api.whatsapp.com') !== -1;
  }

  function ligar() {
    document.addEventListener('click', function (event) {
      var el = event.target.closest('a, button');
      if (!el) return;

      /* Submit é contabilizado apenas após confirmação real do formulário. */
      if (el.tagName === 'BUTTON' && el.type === 'submit') return;

      var href = el.getAttribute('href') || '';
      var ctaId = el.getAttribute('data-conversion') || '';

      if (ehWhatsApp(href, ctaId)) {
        enviar('whatsapp_click', { cta_id: ctaId || 'whatsapp-link' });
        return;
      }

      if (href.indexOf('tel:') === 0) {
        enviar('telefone_click', { telefone: href.replace('tel:', '') });
        return;
      }

      if (href.indexOf('mailto:') === 0) {
        enviar('email_click', { email: href.replace('mailto:', '').split('?')[0] });
        return;
      }

      if (ctaId) {
        enviar('conversao_cta', { cta_id: ctaId });
      }
    }, false);
  }

  carregarMetaPixel();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ligar);
  } else {
    ligar();
  }
})(window, document);
