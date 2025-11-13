
import React from 'react';
import { useTranslation } from 'react-i18next';

const BrandingFooter = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center flex-wrap gap-6">
          
          {/* Sezione Sinistra: Branding e Copyright */}
          <div className="text-left">
            <p className="text-lg font-bold text-white mb-1">{t('footer.brand')}</p>
            <p className="text-xs text-slate-400">{t('footer.copyright')}</p>
          </div>
          
          {/* Sezione Centrale: Tagline */}
          <div className="text-center flex flex-col items-center gap-3">
            <p className="text-slate-300 italic">{t('footer.tagline')}</p>
            <p className="text-xs text-slate-400 max-w-xs">
              {t('footer.support_description')}
            </p>
          </div>
          
          {/* Sezione Destra: Contatti */}
          <div className="text-right">
            <a 
              href="mailto:support@primecapitalinvestment.com" 
              className="text-slate-400 hover:text-lime-400 transition-colors text-sm block mb-1"
            >
              support@primecapitalinvestment.com
            </a>
            <p className="text-slate-400 text-sm">
              24/7 Support Available
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default BrandingFooter;
