import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './DetalhesImovel.css';
import './PropertyMap.css';
import FooterSection from './FooterSection';
import PropertyMap from './PropertyMap';
import CurrencyTooltip from './CurrencyTooltip';
import BitcoinPriceInline from './BitcoinPriceInline';
import { useLocalTranslation } from '../hooks/useLocalTranslation';
import { API_ENDPOINTS } from '../config/api';

interface Imovel {
  id: number;
  tipo: string;
  titulo: string;
  localizacao: string;
  preco: string;
  moeda?: string;
  quartos: number;
  banheiros: number;
  area: string;
  imagens: string[];
  descricao?: string;
  subdescricao?: string;
  caracteristicas: string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  area_util?: number;
  area_privativa?: number;
  area_terreno?: number;
  localizacaoDetalhes: {
    endereco: string;
    coordenadas: {
      latitude: number;
      longitude: number;
    };
  };
  endereco?: string;
  coordenadas?: [number, number];
}

const DetalhesImovel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('galeria');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Variáveis locais para tradução
  const translatedDescription = useLocalTranslation('description', imovel?.descricao || '');
  const translatedSubDescription = useLocalTranslation('subdescription', imovel?.subdescricao || '');
  
  // Traduzir características individualmente
  const translatedChar1 = useLocalTranslation('characteristic_0', imovel?.caracteristicas?.[0] || '');
  const translatedChar2 = useLocalTranslation('characteristic_1', imovel?.caracteristicas?.[1] || '');
  const translatedChar3 = useLocalTranslation('characteristic_2', imovel?.caracteristicas?.[2] || '');
  const translatedChar4 = useLocalTranslation('characteristic_3', imovel?.caracteristicas?.[3] || '');
  const translatedChar5 = useLocalTranslation('characteristic_4', imovel?.caracteristicas?.[4] || '');
  
  // Array de características traduzidas
  const translatedCharacteristics = [
    translatedChar1, translatedChar2, translatedChar3, translatedChar4, translatedChar5
  ].filter(char => char && char.trim() !== '');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Estados para drag/swipe
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }

    // Verificar se usuário está logado
    const token = localStorage.getItem('authToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (token) {
      setIsLoggedIn(true);
      setUserName(name || '');
      setUserEmail(email || '');
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PUBLIC_PROPERTY_DETAIL(parseInt(id || '0')));
      const data = await response.json();

      if (response.ok && data.success) {
        setImovel(data.property);
      } else {
        setError(data.message || 'Imóvel não encontrado');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao buscar imóvel:', err);
    } finally {
      setLoading(false);
    }
  };

  // Países disponíveis para seleção
  const countries = [
    { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
    { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dialCode: '+1' },
    { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', dialCode: '+44' },
    { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33' },
    { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39' },
    { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
    { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57' },
    { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52' },
    { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
    { code: 'UY', name: 'Uruguai', flag: '🇺🇾', dialCode: '+598' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
    { code: 'CA', name: 'Canadá', flag: '🇨🇦', dialCode: '+1' },
    { code: 'AU', name: 'Austrália', flag: '🇦🇺', dialCode: '+61' },
    { code: 'NZ', name: 'Nova Zelândia', flag: '🇳🇿', dialCode: '+64' },
    { code: 'JP', name: 'Japão', flag: '🇯🇵', dialCode: '+81' },
    { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
    { code: 'IN', name: 'Índia', flag: '🇮🇳', dialCode: '+91' },
    { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷', dialCode: '+82' },
    { code: 'SG', name: 'Singapura', flag: '🇸🇬', dialCode: '+65' },
    { code: 'TH', name: 'Tailândia', flag: '🇹🇭', dialCode: '+66' },
    { code: 'MY', name: 'Malásia', flag: '🇲🇾', dialCode: '+60' },
    { code: 'ID', name: 'Indonésia', flag: '🇮🇩', dialCode: '+62' },
    { code: 'PH', name: 'Filipinas', flag: '🇵🇭', dialCode: '+63' },
    { code: 'VN', name: 'Vietnã', flag: '🇻🇳', dialCode: '+84' },
    { code: 'RU', name: 'Rússia', flag: '🇷🇺', dialCode: '+7' },
    { code: 'TR', name: 'Turquia', flag: '🇹🇷', dialCode: '+90' },
    { code: 'SA', name: 'Arábia Saudita', flag: '🇸🇦', dialCode: '+966' },
    { code: 'AE', name: 'Emirados Árabes', flag: '🇦🇪', dialCode: '+971' },
    { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972' },
    { code: 'ZA', name: 'África do Sul', flag: '🇿🇦', dialCode: '+27' },
    { code: 'EG', name: 'Egito', flag: '🇪🇬', dialCode: '+20' },
    { code: 'MA', name: 'Marrocos', flag: '🇲🇦', dialCode: '+212' },
    { code: 'NG', name: 'Nigéria', flag: '🇳🇬', dialCode: '+234' },
    { code: 'KE', name: 'Quênia', flag: '🇰🇪', dialCode: '+254' },
    { code: 'CH', name: 'Suíça', flag: '🇨🇭', dialCode: '+41' },
    { code: 'AT', name: 'Áustria', flag: '🇦🇹', dialCode: '+43' },
    { code: 'BE', name: 'Bélgica', flag: '🇧🇪', dialCode: '+32' },
    { code: 'NL', name: 'Holanda', flag: '🇳🇱', dialCode: '+31' },
    { code: 'SE', name: 'Suécia', flag: '🇸🇪', dialCode: '+46' },
    { code: 'NO', name: 'Noruega', flag: '🇳🇴', dialCode: '+47' },
    { code: 'DK', name: 'Dinamarca', flag: '🇩🇰', dialCode: '+45' },
    { code: 'FI', name: 'Finlândia', flag: '🇫🇮', dialCode: '+358' },
    { code: 'IE', name: 'Irlanda', flag: '🇮🇪', dialCode: '+353' },
    { code: 'PL', name: 'Polônia', flag: '🇵🇱', dialCode: '+48' },
    { code: 'CZ', name: 'República Tcheca', flag: '🇨🇿', dialCode: '+420' },
    { code: 'HU', name: 'Hungria', flag: '🇭🇺', dialCode: '+36' },
    { code: 'RO', name: 'Romênia', flag: '🇷🇴', dialCode: '+40' },
    { code: 'BG', name: 'Bulgária', flag: '🇧🇬', dialCode: '+359' },
    { code: 'GR', name: 'Grécia', flag: '🇬🇷', dialCode: '+30' },
    { code: 'CY', name: 'Chipre', flag: '🇨🇾', dialCode: '+357' },
    { code: 'MT', name: 'Malta', flag: '🇲🇹', dialCode: '+356' },
    { code: 'LU', name: 'Luxemburgo', flag: '🇱🇺', dialCode: '+352' },
    { code: 'IS', name: 'Islândia', flag: '🇮🇸', dialCode: '+354' },
    { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423' }
  ];

  const selectedCountryData = countries.find(country => country.code === selectedCountry);

  // Loading state
  if (loading) {
    return (
      <div className="detalhes-imovel-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando detalhes do imóvel...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !imovel) {
    return (
      <div className="detalhes-imovel-page">
        <div className="error-container">
          <h2>Erro</h2>
          <p>{error || 'Imóvel não encontrado'}</p>
          <button onClick={() => window.history.back()} className="back-btn">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imovel.imagens.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openModal = (imageIndex: number) => {
    setModalImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % imovel.imagens.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      prevModalImage();
    } else if (e.key === 'ArrowRight') {
      nextModalImage();
    }
  };

  // Funções para drag/swipe
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart || !isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStart.x;
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging || !dragStart) return;
    
    const threshold = 50; // Mínimo de pixels para considerar um swipe
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Swipe para direita - imagem anterior
        prevImage();
      } else {
        // Swipe para esquerda - próxima imagem
        nextImage();
      }
    }
    
    setDragStart(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  // Funções para modal drag/swipe
  const handleModalDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleModalDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart || !isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStart.x;
    setDragOffset(deltaX);
  };

  const handleModalDragEnd = () => {
    if (!isDragging || !dragStart) return;
    
    const threshold = 50;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevModalImage();
      } else {
        nextModalImage();
      }
    }
    
    setDragStart(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleInterestClick = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.CREATE_LEAD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: userName,
          telefone: '',
          email: userEmail,
          produto_id: parseInt(id || '1'),
          mensagem: `Interesse demonstrado no imóvel "${imovel?.localizacao || imovel?.titulo}"`
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('✓ Interesse registrado com sucesso! Entraremos em contato em breve.');
      } else {
        setSubmitMessage('Erro ao registrar interesse. Tente novamente.');
      }
    } catch (error) {
      setSubmitMessage('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.CREATE_LEAD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          produto_id: parseInt(id || '1'),
          mensagem: `Interesse demonstrado no imóvel "${imovel?.localizacao || imovel?.titulo}"`
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('Interesse registrado com sucesso! Entraremos em contato em breve.');
        setFormData({ nome: '', telefone: '', email: '' });
      } else {
        setSubmitMessage('Erro ao registrar interesse. Tente novamente.');
      }
    } catch (err) {
      setSubmitMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="detalhes-imovel-page">
      {/* Header horizontal clean */}
      <header className="imovel-header-horizontal">
        <div className="header-container">
          <div className="header-content">
            {/* Botão voltar */}
            <div className="back-section">
              <button className="back-button-clean" onClick={() => window.history.back()}>
                <img src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/677ff1944192728b9fc6cbbf_iconamoon_arrow-left-2-light%20(1).png" alt="Voltar" className="back-icon-clean" />
              </button>
            </div>

            {/* Informações do imóvel */}
            <div className="imovel-info-section">
              <div className="imovel-titulo-section">
                <h1 className="imovel-titulo-clean">{imovel.tipo}, {imovel.localizacao}</h1>
                <div className="price-with-bitcoin">
                  <CurrencyTooltip
                    propertyId={imovel.id}
                    basePrice={imovel.preco}
                    baseCurrency={imovel.moeda || 'EUR'}
                    inline
                  >
                    <span className="imovel-preco-clean">{imovel.preco}</span>
                  </CurrencyTooltip>
                  <BitcoinPriceInline
                    propertyId={imovel.id}
                    basePrice={imovel.preco}
                    baseCurrency={imovel.moeda || 'EUR'}
                  />
                </div>
              </div>
            </div>

            {/* Características com ícones */}
            <div className="caracteristicas-section">
              <div className="caracteristica-item">
                <div className="caracteristica-icon-container">
                  <img
                    src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/68165cc176e3390d4b67a4e6_f7_bed-double%20(4).png"
                    alt={t('properties.bedrooms')}
                    className="caracteristica-icon"
                    width="24"
                    height="24"
                  />
                  <span className="caracteristica-valor">{imovel.quartos}</span>
                </div>
                <span className="caracteristica-label">{t('properties.bedrooms')}</span>
              </div>

              <div className="caracteristica-item">
                <div className="caracteristica-icon-container">
                  <img
                    src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/68165b046b647417416aad7c_majesticons_bath-shower-line%20(4).png"
                    alt={t('properties.bathrooms')}
                    className="caracteristica-icon"
                    width="24"
                    height="24"
                  />
                  <span className="caracteristica-valor">{imovel.banheiros}</span>
                </div>
                <span className="caracteristica-label">{t('properties.bathrooms')}</span>
              </div>

              <div className="caracteristica-item">
                <div className="caracteristica-icon-container">
                  <img
                    src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/68165b0421679bcf162143dd_ic_outline-space-dashboard%20(4).png"
                    alt={t('properties.squareMeters')}
                    className="caracteristica-icon"
                    width="24"
                    height="24"
                  />
                  <span className="caracteristica-valor">{imovel.area.replace('m²', '').replace('m', '')}</span>
                  <span className="caracteristica-unit">m²</span>
                </div>
                <span className="caracteristica-label">{t('properties.squareMeters')}</span>
              </div>
            </div>

            {/* Botão de login */}
            <div className="contact-section">
              <button
                className="contact-button"
                onClick={() => window.location.href = '/login'}
              >
                {t('properties.login')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação sticky */}
      <nav className="sticky-navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="nav-links">
              <button
                className={`nav-link ${activeSection === 'galeria' ? 'active' : ''}`}
                onClick={() => scrollToSection('galeria')}
              >
                {t('properties.gallery')}
              </button>
              <button
                className={`nav-link ${activeSection === 'sobre' ? 'active' : ''}`}
                onClick={() => scrollToSection('sobre')}
              >
                {t('properties.about')}
              </button>
              <button
                className={`nav-link ${activeSection === 'caracteristicas' ? 'active' : ''}`}
                onClick={() => scrollToSection('caracteristicas')}
              >
                {t('properties.generalCharacteristics')}
              </button>
              <button
                className={`nav-link ${activeSection === 'localizacao' ? 'active' : ''}`}
                onClick={() => scrollToSection('localizacao')}
              >
                {t('properties.locationAndAccessibility')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Galeria de fotos */}
      <section id="galeria" className="galeria-section">
        <div className="galeria-container">
          <div 
            className={`galeria-principal ${isDragging ? 'dragging' : ''}`}
            onClick={() => !isDragging && openModal(currentImageIndex)}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{
              transform: isDragging ? `translateX(${dragOffset * 0.1}px)` : 'none',
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            <div className="galeria-image-container">
              <img 
                src={imovel.imagens[currentImageIndex]} 
                alt={`${imovel.tipo} - Imagem ${currentImageIndex + 1}`}
                className="galeria-image"
                draggable={false}
              />
              <div className="galeria-overlay">
                <div className="galeria-info">
                  <span className="galeria-counter">{currentImageIndex + 1} / {imovel.imagens.length}</span>
                  <span className={`galeria-click-hint ${isDragging ? 'dragging' : ''}`}>
                    {isDragging ? 'Arraste para navegar' : 'Clique para ver galeria completa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="galeria-thumbnails">
            {imovel.imagens.map((imagem, index) => (
              <img
                key={index}
                src={imagem}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal da Galeria */}
      {isModalOpen && (
        <div className="galeria-modal" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={0}>
          <div 
            className={`modal-content ${isDragging ? 'dragging' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleModalDragStart}
            onMouseMove={handleModalDragMove}
            onMouseUp={handleModalDragEnd}
            onMouseLeave={handleModalDragEnd}
            onTouchStart={handleModalDragStart}
            onTouchMove={handleModalDragMove}
            onTouchEnd={handleModalDragEnd}
            style={{
              transform: isDragging ? `translateX(${dragOffset * 0.1}px)` : 'none',
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            <button className="modal-close" onClick={closeModal}>
              <span>&times;</span>
            </button>
            
            <button className="modal-arrow modal-arrow-left" onClick={prevModalImage}>
              <img src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/67855e386b7b4bb11ffc7e30_iconamoon_arrow-left-2-light%20(3).png" alt="Anterior" />
            </button>
            
            <div className="modal-image-container">
              <img 
                src={imovel.imagens[modalImageIndex]} 
                alt={`${imovel.tipo} - Imagem ${modalImageIndex + 1}`}
                className="modal-image"
                draggable={false}
              />
              <div className="modal-counter">
                {modalImageIndex + 1} / {imovel.imagens.length}
              </div>
            </div>
            
            <button className="modal-arrow modal-arrow-right" onClick={nextModalImage}>
              <img src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/67855e46a55b89c173ca7457_iconamoon_arrow-right-2-light%20(4).png" alt="Próximo" />
            </button>
            
            <div className="modal-thumbnails">
              {imovel.imagens.map((imagem, index) => (
                <img
                  key={index}
                  src={imagem}
                  alt={`Thumbnail ${index + 1}`}
                  className={`modal-thumbnail ${index === modalImageIndex ? 'active' : ''}`}
                  onClick={() => setModalImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Seção Sobre */}
      <section id="sobre" className="sobre-section">
        <div className="sobre-container">
          <div className="sobre-content">
            <h2>{t('properties.aboutProperty')}</h2>
            
            <div className="sobre-text">
              {imovel.descricao && imovel.descricao.trim() !== '' ? (
                <p>{translatedDescription}</p>
              ) : (
                <p>Descrição do imóvel será adicionada em breve.</p>
              )}
              {imovel.subdescricao && imovel.subdescricao.trim() !== '' && (
                <p>{translatedSubDescription}</p>
              )}
              
              <div className="caracteristicas-inline">
                <div className="caracteristicas-grid">
                  {translatedCharacteristics.map((caracteristica, index) => (
                    <div key={index} className="caracteristica-item">
                      <span className="caracteristica-check">✓</span>
                      <span className="caracteristica-text">
                        {caracteristica}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sobre-details">
                <div className="detail-row">
                  <span className="detail-label">{t('properties.type')}</span>
                  <span className="detail-value">{imovel.tipo}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('properties.location')}</span>
                  <span className="detail-value">{imovel.localizacao}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('properties.areaUtil')}</span>
                  <span className="detail-value">{imovel.area}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('properties.bedrooms')}</span>
                  <span className="detail-value">{imovel.quartos}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('properties.bathrooms')}</span>
                  <span className="detail-value">{imovel.banheiros}</span>
                </div>
              </div>

              <div className="price-section">
                <span className="price-label">{t('properties.value')}</span>
                <div className="price-with-bitcoin-inline">
                  <CurrencyTooltip
                    propertyId={imovel.id}
                    basePrice={imovel.preco}
                    baseCurrency={imovel.moeda || 'EUR'}
                    inline
                  >
                    <span className="price-value">{imovel.preco}</span>
                  </CurrencyTooltip>
                  <BitcoinPriceInline
                    propertyId={imovel.id}
                    basePrice={imovel.preco}
                    baseCurrency={imovel.moeda || 'EUR'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="contact-sidebar">
            <div className="property-details-price-block">
              <div className="property-agent-block">
                <div className="color-text-dark bold margin-bottom-05">{t('properties.agentTitle')}</div>
                <p className="color-text-dark custom">{t('properties.agentDescription')}</p>
                <div className="property-agent-wrap">
                  <div className="property-agent-image-wrap">
                    <img src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/677bd9434152ae00fcff4c37_Ian%20Linhares.png" loading="lazy" alt="PFP Ian Linhares" />
                  </div>
                  <div className="property-agent-details">
                    <div className="color-text-dark custom">Ian Linhares</div>
                    <div className="agent-contact-details">
                      <img src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/677937d7981c4d87af247408_f7_bed-double-fill%20(2).png" loading="lazy" width="Auto" alt="" className="image-4" />
                      <div className="color-text-dark custom">+55 (11) 98765-4321</div>
                    </div>
                    <div className="agent-contact-details">
                      <img src="https://cdn.prod.website-files.com/6764ba3d6fb9b938c767210f/677937d7981c4d87af247408_f7_bed-double-fill%20(2).png" loading="lazy" width="Auto" alt="" className="image-4" />
                      <div className="color-text-dark custom">linhares@opendoors.xyz</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="property-contact-form">
                <div className="w-form">
                  {isLoggedIn ? (
                    // Layout para usuário logado - apenas botão
                    <div className="logged-in-contact">
                      {submitMessage && (
                        <div className={`submit-message ${submitMessage.includes('sucesso') ? 'success' : 'error'}`}>
                          {submitMessage}
                        </div>
                      )}
                      <div className="logged-user-info">
                        <p className="color-text-dark custom">
                          {t('properties.loggedInGreeting')}, <strong>{userName || 'Usuário'}</strong>!
                        </p>
                        <p className="color-text-dark custom">
                          {t('properties.loggedInMessage')}
                        </p>
                      </div>
                      <div className="padding-top-1">
                        <button
                          type="button"
                          onClick={handleInterestClick}
                          className="button trocar-cores w-button interest-button-large"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t('properties.registering') : `💎 ${t('properties.interested')}`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Layout para usuário não logado - formulário completo
                    <form onSubmit={handleFormSubmit} aria-label="Lead Capture Form">
                      {submitMessage && (
                        <div className={`submit-message ${submitMessage.includes('sucesso') ? 'success' : 'error'}`}>
                          {submitMessage}
                        </div>
                      )}

                      <label htmlFor="nome" className="color-text-dark custom">{t('properties.name')}</label>
                      <input
                        className="text-field-3 w-input"
                        maxLength={256}
                        name="nome"
                        data-name={t('properties.name')}
                        placeholder={t('properties.fullNamePlaceholder')}
                        type="text"
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                      />

                    <label htmlFor="telefone" className="color-text-dark custom">{t('properties.phone')}</label>
                    <div className="phone-input-container">
                      <div className="country-selector">
                        <select 
                          value={selectedCountry} 
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="country-select"
                        >
                          {countries.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.dialCode}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        className="text-field-3 phone-input"
                        maxLength={20}
                        name="telefone"
                        data-name={t('properties.phone')}
                        placeholder={t('properties.phoneNumberPlaceholder')}
                        type="tel"
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        required
                      />
                    </div>

                    <label htmlFor="email" className="color-text-dark custom">{t('properties.email')}</label>
                    <input
                      className="text-field-3 w-input"
                      maxLength={256}
                      name="email"
                      data-name={t('properties.email')}
                      placeholder={t('properties.emailPlaceholder')}
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />

                    <div className="padding-top-1">
                      <button
                        type="submit"
                        className="button trocar-cores w-button"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('properties.sendingButton') : t('properties.sendButton')}
                      </button>
                    </div>
                  </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Seção Características Gerais */}
      <section id="caracteristicas" className="caracteristicas-gerais-section">
        <div className="caracteristicas-gerais-content">
          <h2>{t('properties.generalCharacteristics')}</h2>
          <div className="info-tabs">
            <span className="tab-active">{t('properties.generalInfo')}</span>
          </div>

          <div className="info-grid">
            <div className="info-column">
              <div className="info-item">
                <span className="info-label">{t('properties.reference')}</span>
                <span className="info-value">REF_{imovel.id.toString().padStart(8, '0')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.squareMeters')}</span>
                <span className="info-value">{imovel.area}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.property')}</span>
                <span className="info-value">{imovel.tipo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.city')}</span>
                <span className="info-value">{imovel.cidade || imovel.localizacao}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.country')}</span>
                <span className="info-value">{imovel.pais || 'Brasil'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.usableArea')}</span>
                <span className="info-value">{imovel.area_util ? `${imovel.area_util}m²` : 'N/A m²'}</span>
              </div>
            </div>

            <div className="info-column">
              <div className="info-item">
                <span className="info-label">{t('properties.salePrice')}</span>
                <div className="info-value-with-bitcoin">
                  <CurrencyTooltip
                    propertyId={imovel.id}
                    basePrice={imovel.preco}
                    baseCurrency={imovel.moeda || 'EUR'}
                    inline
                  >
                    <span className="info-value">{imovel.preco}</span>
                  </CurrencyTooltip>
                  <BitcoinPriceInline
                    propertyId={imovel.id}
                    basePrice={imovel.preco}
                    baseCurrency={imovel.moeda || 'EUR'}
                  />
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.pricePerSquareMeter')}</span>
                <span className="info-value">
                  {(() => {
                    // Remover tudo exceto números e vírgulas, depois remover vírgulas (separadores de milhares)
                    const precoNumerico = parseFloat(imovel.preco.replace(/[^\d.,]/g, '').replace(/,/g, ''));
                    const areaNumerica = parseFloat(imovel.area.replace(/[^\d.,]/g, '').replace(/,/g, ''));
                    if (precoNumerico && areaNumerica) {
                      const precoPorM2 = precoNumerico / areaNumerica;
                      const moeda = imovel.moeda || 'EUR';
                      
                      // Mapear códigos de moeda para símbolos
                      const simbolosMoeda: { [key: string]: string } = {
                        'EUR': '€',
                        'USD': '$',
                        'BRL': 'R$',
                        'GBP': '£',
                        'JPY': '¥'
                      };
                      
                      const simbolo = simbolosMoeda[moeda] || moeda;
                      return `${simbolo} ${precoPorM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/m²`;
                    }
                    return 'N/A';
                  })()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.neighborhood')}</span>
                <span className="info-value">{imovel.bairro || 'Centro'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.state')}</span>
                <span className="info-value">{imovel.estado || 'SP'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.privateArea')}</span>
                <span className="info-value">{imovel.area_privativa ? `${imovel.area_privativa}m²` : imovel.area}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('properties.landArea')}</span>
                <span className="info-value">{imovel.area_terreno ? `${imovel.area_terreno}m²` : 'N/A m²'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Localização */}
      <section id="localizacao" className="localizacao-section">
        <div className="container">
          <div className="localizacao-content">
            {imovel.localizacaoDetalhes?.coordenadas && (
              <PropertyMap
                address={imovel.localizacaoDetalhes.endereco}
                coordinates={[
                  imovel.localizacaoDetalhes.coordenadas.latitude,
                  imovel.localizacaoDetalhes.coordenadas.longitude
                ]}
                propertyName={imovel.titulo}
                price={imovel.preco}
                type={imovel.tipo}
              />
            )}
            {!imovel.localizacaoDetalhes?.coordenadas && (
              <div className="no-location-message">
                <p>📍 {t('properties.locationNotAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default DetalhesImovel;
