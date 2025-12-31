import { X } from 'lucide-react';

export default function AboutModal({ onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content about-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Uygulama Hakkında</h2>
                    <button onClick={onClose} className="btn btn-small btn-ghost">
                        <X size={24} />
                    </button>
                </div>

                <div className="about-content">
                    <div className="about-hero">
                        <h1 className="about-app-title">Monopoly Digital Bank</h1>
                        <div className="about-version">Versiyon 1.0.0</div>
                    </div>

                    <div className="about-developer">
                        <p className="about-made-by">Geliştirici</p>
                        <p className="about-developer-name">Gökhan Ton</p>
                    </div>

                    <div className="about-section">
                        <p className="about-description">
                            Monopoly masa oyunları için modern, web tabanlı dijital bankacılık uygulaması.
                        </p>
                        <p className="about-description">
                            Kağıt paraları unutun! Her oyuncu tarayıcısından bakiyesini görebilir ve
                            gerçek zamanlı olarak diğer oyunculara veya bankaya para transferi yapabilir.
                        </p>
                    </div>

                    <div className="about-section">
                        <h3 className="about-subtitle">Nasıl Kullanılır:</h3>
                        <ol className="about-list">
                            <li>Bir oyuncu web sitesinden yeni oyun oluşturur</li>
                            <li>Diğer oyuncular telefonlarından siteye girer</li>
                            <li>Oyun kodunu girerek aynı oyuna katılırlar</li>
                            <li>Artık tüm işlemler dijital ortamda yapılır</li>
                            <li>Keyifli oyunlar! 🎲</li>
                        </ol>
                    </div>

                    <div className="about-section">
                        <h3 className="about-subtitle">Özellikler:</h3>
                        <ul className="about-list">
                            <li>💰 Başlangıç sermayesi ve maaş ayarları</li>
                            <li>💸 Oyuncular arası para transferi</li>
                            <li>🏦 Bankadan para çekme ve yatırma</li>
                            <li>🅿️ Ücretsiz otopark havuzu</li>
                            <li>📊 Detaylı işlem geçmişi</li>
                            <li>💔 Otomatik iflas kontrolü</li>
                            <li>🏆 Oyun sonu istatistikleri</li>
                            <li>⏱️ Oyun süresi takibi</li>
                        </ul>
                    </div>

                    <div className="about-section">
                        <h3 className="about-subtitle">Neden Monopoly Digital Bank?</h3>
                        <ul className="about-list">
                            <li>Kağıt paraları kaybetme ve karıştırma derdi yok</li>
                            <li>Hızlı ve hatasız para transferleri</li>
                            <li>Tüm işlemler otomatik kaydedilir</li>
                            <li>Oyun sonunda detaylı istatistikler</li>
                            <li>Oyun akışı kesintisiz devam eder</li>
                        </ul>
                    </div>

                    <div className="about-footer">
                        <p className="about-note">
                            💡 İPUCU: Oyun sırasında her oyuncunun telefonunu açık tutması önerilir.
                            Böylece bakiyenizi ve işlemleri gerçek zamanlı takip edebilirsiniz.
                        </p>
                        <div className="about-credits">
                            <p className="about-year">© 2025 • Monopoly Digital Bank</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
