import React, { useLayoutEffect, useState } from 'react';
import TearTicket from './TearTicket.jsx';
import './OfferCoupons.css';

const coupons = [
  {
    id: 'bemvindo', code: 'BEMVINDO10', discount: 'R$ 10 OFF',
    detail: 'No primeiro pedido acima de R$ 39', stubLabel: 'PRIMEIRO PEDIDO',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Hambúrguer artesanal com queijo e salada',
  },
  {
    id: 'sabor', code: 'SABOR15', discount: '15% OFF',
    detail: 'Em pedidos acima de R$ 50', stubLabel: 'SEU PRÓXIMO SABOR',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Pizza artesanal recém-assada',
  },
  {
    id: 'entrega', code: 'ENTREGAZERO', discount: 'FRETE GRÁTIS',
    detail: 'Em restaurantes selecionados', stubLabel: 'SEM TAXA DE ENTREGA',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Seleção de sushi e sashimi',
  },
  {
    id: 'doce', code: 'DOCEND', discount: '20% OFF',
    detail: 'Para adoçar seu pedido', stubLabel: 'UM MIMO DOCE',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Sobremesa doce com cobertura',
  },
];

function announce(code) {
  window.dispatchEvent(new CustomEvent('nuvora:coupon-redeemed', { detail: { code } }));
}

export default function OfferCoupons() {
  const [redeemed, setRedeemed] = useState(() => new Set());

  useLayoutEffect(() => {
    window.dispatchEvent(new Event('nuvora:offers-mounted'));
  }, []);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      window.dispatchEvent(new CustomEvent('nuvora:coupon-copied', { detail: { code } }));
    } catch {
      window.dispatchEvent(new CustomEvent('nuvora:coupon-copied', { detail: { code } }));
    }
  };

  return (
    <div className="offer-coupon-grid__items">
      {coupons.map((coupon, index) => {
        const used = redeemed.has(coupon.id);
        return (
          <article
            className="offer-coupon"
            key={coupon.id}
            data-offer-card="coupon"
            data-search={`${coupon.code} ${coupon.discount} ${coupon.detail} ${coupon.stubLabel}`.toLocaleLowerCase('pt-BR')}
          >
            <TearTicket
              className="offer-coupon__ticket"
              image={coupon.image}
              imageAlt={coupon.imageAlt}
              stub={(
                <div className="offer-coupon__stub">
                  <span>{coupon.stubLabel}</span>
                  <strong>{coupon.code}</strong>
                  <small>{used ? 'RESGATADO' : 'PUXE PARA RASGAR'}</small>
                </div>
              )}
              orientation="horizontal"
              scrim
              imageRadius={8}
              onTear={() => {
                setRedeemed((current) => new Set(current).add(coupon.id));
                announce(coupon.code);
              }}
              width={620}
              height={330}
              stubSize={180}
              radius={16}
              holes={12}
              holeSize={6}
              notch={3}
              roughness={0}
              tearAngle={30}
              stretch={30}
              resistance={0.45}
              rotate={index % 2 === 0 ? 2 : -2}
              tilt
              tiltMax={9}
              tiltReach={260}
              parallax={6}
              perspective={1000}
              background="#27272a"
              color="#f5f5f5"
              border
              borderWidth={1}
              recenter
              tearHint
              ariaLabel={`${used ? 'Cupom resgatado' : 'Arraste a aba para rasgar e resgatar o cupom'} ${coupon.code}`}
            >
              <div className="offer-coupon__copy">
                <span>{coupon.stubLabel}</span>
                <strong>{coupon.discount}</strong>
                <p>{coupon.detail}</p>
                <div className="offer-coupon__code-row">
                  <code>{coupon.code}</code>
                  <button type="button" onClick={() => copyCode(coupon.code)} aria-label={`Copiar cupom ${coupon.code}`}>
                    Copiar código
                  </button>
                </div>
              </div>
            </TearTicket>
          </article>
        );
      })}
    </div>
  );
}
