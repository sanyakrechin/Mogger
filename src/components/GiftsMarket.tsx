import { useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import { GIFTS_CATALOG } from '../data/giftsData';
import './GiftsMarket.css';

export default function GiftsMarket() {
  const { state, dispatch } = useAppState();
  const [filter, setFilter] = useState<'all' | 'owned' | 'market' | 'soulbound'>('all');
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const purchasedSet = new Set(state.gamification?.purchasedGiftIds || []);
  const equippedSet = new Set(state.gamification?.equippedGiftIds || []);

  const filteredGifts = GIFTS_CATALOG.filter(gift => {
    if (filter === 'owned') return purchasedSet.has(gift.id);
    if (filter === 'market') return !gift.isSoulbound && !purchasedSet.has(gift.id);
    if (filter === 'soulbound') return gift.isSoulbound;
    return true;
  });

  const handleBuy = (giftId: string, price: number) => {
    if (state.gamification.coins < price) return;
    dispatch({ type: 'BUY_GIFT', giftId, price });
  };

  const handleEquip = (giftId: string) => {
    dispatch({ type: 'EQUIP_GIFT', giftId });
  };

  const handleAddDemoCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', amount });
    setShowRechargeModal(false);
  };

  return (
    <div className="gifts-market animate-fade-in">
      {/* Top Header Card */}
      <div className="gm-header-card">
        <div className="gm-balance-box">
          <span className="gm-balance-label">БАЛАНС MOGGER COINS</span>
          <div className="gm-balance-val">
            <Coins size={24} />
            <span>{state.gamification.coins} 🪙</span>
          </div>
        </div>

        <button className="gm-buy-coins-btn" onClick={() => setShowRechargeModal(true)}>
          <Sparkles size={16} />
          ПОПОЛНИТЬ МОНЕТЫ
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="gm-tabs">
        <button
          className={`gm-tab-btn ${filter === 'all' ? 'gm-tab-btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ВСЕ ПОДАРКИ
        </button>
        <button
          className={`gm-tab-btn ${filter === 'owned' ? 'gm-tab-btn--active' : ''}`}
          onClick={() => setFilter('owned')}
        >
          В ИНВЕНТАРЕ ({purchasedSet.size})
        </button>
        <button
          className={`gm-tab-btn ${filter === 'market' ? 'gm-tab-btn--active' : ''}`}
          onClick={() => setFilter('market')}
        >
          МАГАЗИН
        </button>
        <button
          className={`gm-tab-btn ${filter === 'soulbound' ? 'gm-tab-btn--active' : ''}`}
          onClick={() => setFilter('soulbound')}
        >
          🏆 ЗА ЗАСЛУГИ
        </button>
      </div>

      {/* Grid of Gifts */}
      <div className="gm-grid">
        {filteredGifts.map(gift => {
          const isPurchased = purchasedSet.has(gift.id);
          const isEquipped = equippedSet.has(gift.id);
          const canAfford = state.gamification.coins >= gift.priceCoins;

          return (
            <div key={gift.id} className={`gm-card gm-card--${gift.rarity}`}>
              <div className="gm-card-shimmer" />

              <span className={`gm-card-rarity rarity-${gift.rarity}`}>
                {gift.rarity}
              </span>

              <div className="gm-card-icon">{gift.icon}</div>
              <div className="gm-card-title">{gift.name}</div>
              <div className="gm-card-desc">{gift.description}</div>

              <div className="gm-card-actions">
                {gift.isSoulbound ? (
                  isPurchased ? (
                    <button
                      className={`gm-equip-btn ${isEquipped ? 'gm-equip-btn--active' : ''}`}
                      onClick={() => handleEquip(gift.id)}
                    >
                      {isEquipped ? 'ВИТРИНА ✓' : '+ НА ВИТРИНУ'}
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      🔒 ЗА БОСС-КВЕСТ
                    </div>
                  )
                ) : isPurchased ? (
                  <button
                    className={`gm-equip-btn ${isEquipped ? 'gm-equip-btn--active' : ''}`}
                    onClick={() => handleEquip(gift.id)}
                  >
                    {isEquipped ? 'ВИТРИНА ✓' : '+ НА ВИТРИНУ'}
                  </button>
                ) : (
                  <button
                    className="gm-buy-btn"
                    disabled={!canAfford}
                    onClick={() => handleBuy(gift.id, gift.priceCoins)}
                  >
                    {gift.priceCoins} 🪙 КУПИТЬ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Recharge Modal */}
      {showRechargeModal && (
        <div className="week-dash__modal-overlay" onClick={() => setShowRechargeModal(false)}>
          <div className="week-dash__modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="week-dash__modal-header">
              <h3>ПОПОЛНЕНИЕ MOGGER COINS</h3>
            </div>
            <div className="week-dash__modal-body" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                В Telegram Mini App оплата происходит через <strong>Telegram Stars (Звёзды)</strong> или СБП. Выбери пак монет для теста:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn btn--primary"
                  onClick={() => handleAddDemoCoins(500)}
                >
                  ⭐️ 50 Stars — 500 🪙 Mogger Coins
                </button>
                <button
                  className="btn btn--primary"
                  style={{ background: 'linear-gradient(135deg, var(--amber), var(--red))' }}
                  onClick={() => handleAddDemoCoins(2500)}
                >
                  🔥 250 Stars — 2500 🪙 Mogger Coins (Выгодно)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
