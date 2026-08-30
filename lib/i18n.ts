export type Language = 'fr' | 'en' | 'es';

export interface Translations {
  nav: {
    services: string;
    process: string;
    portfolio: string;
    tryTool: string;
    studio: string;
    planche: string;
    signIn: string;
    signUp: string;
    logout: string;
  };
  home: {
    heroBadge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    accessStudio: string;
    plancheTool: string;
    expertiseSub: string;
    expertiseTitle: string;
    expertiseDesc: string;
    nestingTitle: string;
    nestingDesc: string;
    antiHaloTitle: string;
    antiHaloDesc: string;
    prepTitle: string;
    prepDesc: string;
    workflowSub: string;
    workflowTitle: string;
    workflowDesc: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    gallerySub: string;
    galleryTitle: string;
    readyCTA: string;
    readySub: string;
    startFree: string;
  };
  studio: {
    title: string;
    subtitle: string;
    uploadImage: string;
    preview: string;
    fabricColor: string;
    bgRemoval: string;
    antiHalo: string;
    cleaning: string;
    colors: string;
    finishes: string;
    upscale: string;
    downloadColor: string;
    downloadWhite: string;
    buyCredits: string;
    credits: string;
  };
  planche: {
    title: string;
    subtitle: string;
    uploadImages: string;
    preview: string;
    tagDimensions: string;
    machineConfig: string;
    queue: string;
    clear: string;
    downloadPDF: string;
    addFormat: string;
  };
  footer: {
    desc: string;
    tools: string;
    contact: string;
    rights: string;
    terms: string;
    privacy: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    continueWithGoogle: string;
    or: string;
    signUpWithEmail: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    password: string;
    verifyTitle: string;
    verifyDesc: string;
    verifyBtn: string;
    enterCode: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    submitSignUp: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    nav: {
      services: "Services",
      process: "Processus",
      portfolio: "Galerie",
      tryTool: "Essayer l'outil",
      studio: "Studio DTF Pro",
      planche: "Outil Planche",
      signIn: "Connexion",
      signUp: "Créer un compte",
      logout: "Déconnexion",
    },
    home: {
      heroBadge: "Solution DTF Nouvelle Génération",
      heroTitle1: "Vos visuels,",
      heroTitle2: "prêts à imprimer.",
      heroDesc: "Optimisation de nesting, détourage chirurgical anti-halo et préparation professionnelle de vos fichiers pour une impression DTF sans compromis.",
      accessStudio: "Accéder au Studio",
      plancheTool: "Outil Planche",
      expertiseSub: "Notre Expertise",
      expertiseTitle: "Une préparation de fichier irréprochable",
      expertiseDesc: "Chaque pixel compte. Nous automatisons les tâches complexes pour garantir un résultat d'impression parfait à chaque fois.",
      nestingTitle: "Optimisation & Nesting",
      nestingDesc: "Agencement intelligent et automatique de vos motifs sur la laize de film. Réduisez vos chutes de film et maximisez la rentabilité de chaque impression.",
      antiHaloTitle: "Détourage & Anti-Halo",
      antiHaloDesc: "Suppression de fond chirurgicale avec lissage des contours. Éliminez les bordures blanches (halos) pour un transfert net et professionnel sur tous les textiles.",
      prepTitle: "Préparation Machine DTF",
      prepDesc: "Calibrage des couleurs, gestion optimale des couches de blanc et export en PDF haute résolution prêt à l'emploi pour votre RIP et votre imprimante.",
      workflowSub: "Flux de Travail",
      workflowTitle: "De l'import au fichier prêt à imprimer en 3 étapes",
      workflowDesc: "Notre studio en ligne simplifie la préparation de vos fichiers DTF. Plus besoin de logiciels lourds ou de compétences techniques avancées en graphisme.",
      step1Title: "Importation",
      step1Desc: "Glissez-déposez vos images (PNG, JPG, SVG). Notre système les analyse instantanément.",
      step2Title: "Traitement",
      step2Desc: "Ajustez les dimensions, lancez le détourage automatique et optimisez le nesting sur la laize.",
      step3Title: "Export",
      step3Desc: "Téléchargez votre planche au format PDF haute définition, calibrée pour votre machine.",
      gallerySub: "Résultats Concrets",
      galleryTitle: "Galerie de Préparation",
      readyCTA: "Prêt à optimiser votre production DTF ?",
      readySub: "Rejoignez les professionnels de l'impression qui gagnent du temps et de l'argent avec VXEL Studio.",
      startFree: "Commencer gratuitement",
    },
    studio: {
      title: "VXEL DTF Studio Pro",
      subtitle: "Optimisation et retouche de fichiers",
      uploadImage: "Charger une image",
      preview: "Prévisualisation",
      fabricColor: "Couleur tissu",
      bgRemoval: "Suppression du fond",
      antiHalo: "Anti-halo & Luma Key",
      cleaning: "Nettoyage contours",
      colors: "Couleurs",
      finishes: "Finitions",
      upscale: "Upscale & Dimensions",
      downloadColor: "📥 PNG Couleur",
      downloadWhite: "⚪ White Base",
      buyCredits: "➕ Acheter",
      credits: "crédits",
    },
    planche: {
      title: "VXEL Planche DTF Pro",
      subtitle: "Générateur automatique de planches d'impression",
      uploadImages: "Charger des images",
      preview: "Aperçu Visuel",
      tagDimensions: "Dimensions du Tag",
      machineConfig: "Configuration Machine",
      queue: "File d'Attente",
      clear: "Vider",
      downloadPDF: "Télécharger PDF",
      addFormat: "➕ Ajouter 5x ce format",
    },
    footer: {
      desc: "La solution tout-en-un pour la préparation, l'optimisation et l'export de vos fichiers d'impression Direct to Film.",
      tools: "Outils",
      contact: "Contact",
      rights: "Tous droits réservés.",
      terms: "Mentions légales",
      privacy: "Confidentialité",
    },
    auth: {
      signIn: "Connexion",
      signUp: "Créer un compte",
      continueWithGoogle: "Continuer avec Google",
      or: "ou",
      signUpWithEmail: "S'inscrire avec email",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      company: "Entreprise (optionnel)",
      password: "Mot de passe",
      verifyTitle: "Vérification du compte",
      verifyDesc: "Saisissez le code à 6 chiffres envoyé à votre adresse email.",
      verifyBtn: "Vérifier l'email",
      enterCode: "Code à 6 chiffres",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      dontHaveAccount: "Pas encore de compte ?",
      submitSignUp: "Créer mon compte VXEL",
    },
  },
  en: {
    nav: {
      services: "Services",
      process: "Process",
      portfolio: "Gallery",
      tryTool: "Try tool",
      studio: "DTF Studio Pro",
      planche: "Gang Sheet Tool",
      signIn: "Sign In",
      signUp: "Create account",
      logout: "Sign Out",
    },
    home: {
      heroBadge: "Next Gen DTF Solution",
      heroTitle1: "Your visuals,",
      heroTitle2: "ready to print.",
      heroDesc: "Nesting optimization, surgical anti-halo background removal, and professional file prep for compromise-free DTF printing.",
      accessStudio: "Access Studio",
      plancheTool: "Gang Sheet Tool",
      expertiseSub: "Our Expertise",
      expertiseTitle: "Flawless File Preparation",
      expertiseDesc: "Every pixel counts. We automate complex tasks to guarantee perfect print results every time.",
      nestingTitle: "Optimization & Nesting",
      nestingDesc: "Smart automatic layout of your patterns on the film roll width. Reduce film waste and maximize print profitability.",
      antiHaloTitle: "Background Removal & Anti-Halo",
      antiHaloDesc: "Surgical background removal with edge smoothing. Eliminate white borders (halos) for clean transfers on all textiles.",
      prepTitle: "DTF Machine Setup",
      prepDesc: "Color calibration, optimal white layer management, and high-res PDF export ready for your RIP and printer.",
      workflowSub: "Workflow",
      workflowTitle: "From Import to Print-Ready File in 3 Steps",
      workflowDesc: "Our online studio simplifies DTF file prep. No heavy software or advanced graphic skills needed.",
      step1Title: "Import",
      step1Desc: "Drag & drop your images (PNG, JPG, SVG). Our system analyzes them instantly.",
      step2Title: "Processing",
      step2Desc: "Adjust dimensions, run auto background removal, and optimize gang sheet nesting.",
      step3Title: "Export",
      step3Desc: "Download your high-definition PDF gang sheet, calibrated for your machine.",
      gallerySub: "Real Results",
      galleryTitle: "Preparation Gallery",
      readyCTA: "Ready to optimize your DTF production?",
      readySub: "Join printing professionals saving time and money with VXEL Studio.",
      startFree: "Start for free",
    },
    studio: {
      title: "VXEL DTF Studio Pro",
      subtitle: "File optimization & editing",
      uploadImage: "Upload image",
      preview: "Preview",
      fabricColor: "Garment Color",
      bgRemoval: "Background Removal",
      antiHalo: "Anti-Halo & Luma Key",
      cleaning: "Edge Cleaning",
      colors: "Colors",
      finishes: "Finishes",
      upscale: "Upscale & Dimensions",
      downloadColor: "📥 Color PNG",
      downloadWhite: "⚪ White Base",
      buyCredits: "➕ Buy Credits",
      credits: "credits",
    },
    planche: {
      title: "VXEL Gang Sheet Pro",
      subtitle: "Automatic DTF gang sheet generator",
      uploadImages: "Upload images",
      preview: "Visual Preview",
      tagDimensions: "Tag Dimensions",
      machineConfig: "Machine Setup",
      queue: "Print Queue",
      clear: "Clear",
      downloadPDF: "Download PDF",
      addFormat: "➕ Add 5x format",
    },
    footer: {
      desc: "The all-in-one solution for Direct to Film print preparation, optimization, and export.",
      tools: "Tools",
      contact: "Contact",
      rights: "All rights reserved.",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
    },
    auth: {
      signIn: "Sign In",
      signUp: "Create an Account",
      continueWithGoogle: "Continue with Google",
      or: "or",
      signUpWithEmail: "Sign up with email",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      company: "Company (optional)",
      password: "Password",
      verifyTitle: "Account Verification",
      verifyDesc: "Enter the 6-digit code sent to your email address.",
      verifyBtn: "Verify Email",
      enterCode: "6-digit verification code",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      submitSignUp: "Create my VXEL Account",
    },
  },
  es: {
    nav: {
      services: "Servicios",
      process: "Proceso",
      portfolio: "Galería",
      tryTool: "Probar herramienta",
      studio: "DTF Studio Pro",
      planche: "Herramienta Plancha",
      signIn: "Iniciar Sesión",
      signUp: "Crear cuenta",
      logout: "Cerrar Sesión",
    },
    home: {
      heroBadge: "Solución DTF Nueva Generación",
      heroTitle1: "Tus diseños,",
      heroTitle2: "listos para imprimir.",
      heroDesc: "Optimización de anidamiento, eliminación quirúrgica de fondos anti-halo y preparación profesional de archivos para impresión DTF sin concesiones.",
      accessStudio: "Acceder al Studio",
      plancheTool: "Herramienta Plancha",
      expertiseSub: "Nuestra Experiencia",
      expertiseTitle: "Preparación Impecable de Archivos",
      expertiseDesc: "Cada píxel cuenta. Automatizamos tareas complejas para garantizar resultados de impresión perfectos cada vez.",
      nestingTitle: "Optimización y Anidamiento",
      nestingDesc: "Disposición inteligente de sus diseños en el ancho del film. Reduzca residuos de film y maximice la rentabilidad.",
      antiHaloTitle: "Eliminación de Fondo y Anti-Halo",
      antiHaloDesc: "Eliminación quirúrgica de fondo con suavizado de bordes. Elimine bordes blancos para transferencias impecables.",
      prepTitle: "Preparación Máquina DTF",
      prepDesc: "Calibración de color, gestión óptima de capa de blanco y exportación en PDF de alta resolución listo para RIP.",
      workflowSub: "Flujo de Trabajo",
      workflowTitle: "De la Importación al Archivo Listo en 3 Pasos",
      workflowDesc: "Nuestro estudio en línea simplifica la preparación de archivos DTF. Sin software pesado ni conocimientos avanzados.",
      step1Title: "Importación",
      step1Desc: "Arrastre y suelte sus imágenes (PNG, JPG, SVG). Nuestro sistema las analiza al instante.",
      step2Title: "Procesamiento",
      step2Desc: "Ajuste dimensiones, ejecute eliminación automática de fondo y optimice la plancha.",
      step3Title: "Exportación",
      step3Desc: "Descargue su plancha PDF en alta definición, calibrada para su máquina.",
      gallerySub: "Resultados Reales",
      galleryTitle: "Galería de Preparación",
      readyCTA: "¿Listo para optimizar su producción DTF?",
      readySub: "Únase a los profesionales de la impresión que ahorran tiempo y dinero con VXEL Studio.",
      startFree: "Comenzar gratis",
    },
    studio: {
      title: "VXEL DTF Studio Pro",
      subtitle: "Optimización y edición de archivos",
      uploadImage: "Cargar imagen",
      preview: "Previsualización",
      fabricColor: "Color de prenda",
      bgRemoval: "Eliminación de fondo",
      antiHalo: "Anti-Halo y Luma Key",
      cleaning: "Limpieza de bordes",
      colors: "Colores",
      finishes: "Acabados",
      upscale: "Escalado y Dimensiones",
      downloadColor: "📥 PNG Color",
      downloadWhite: "⚪ Base Blanca",
      buyCredits: "➕ Comprar Créditos",
      credits: "créditos",
    },
    planche: {
      title: "VXEL Plancha DTF Pro",
      subtitle: "Generador automático de planchas DTF",
      uploadImages: "Cargar imágenes",
      preview: "Vista Previa",
      tagDimensions: "Dimensiones de Etiqueta",
      machineConfig: "Configuración de Máquina",
      queue: "Cola de Impresión",
      clear: "Vaciar",
      downloadPDF: "Descargar PDF",
      addFormat: "➕ Añadir 5x este formato",
    },
    footer: {
      desc: "La solución todo en uno para preparación, optimización y exportación de impresión DTF.",
      tools: "Herramientas",
      contact: "Contacto",
      rights: "Todos los derechos reservados.",
      terms: "Términos de Servicio",
      privacy: "Política de Privacidad",
    },
    auth: {
      signIn: "Iniciar Sesión",
      signUp: "Crear una Cuenta",
      continueWithGoogle: "Continuar con Google",
      or: "o",
      signUpWithEmail: "Registrarse con correo",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo Electrónico",
      phone: "Teléfono",
      company: "Empresa (opcional)",
      password: "Contraseña",
      verifyTitle: "Verificación de Cuenta",
      verifyDesc: "Ingrese el código de 6 dígitos enviado a su correo electrónico.",
      verifyBtn: "Verificar Correo",
      enterCode: "Código de 6 dígitos",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      dontHaveAccount: "¿No tienes cuenta?",
      submitSignUp: "Crear mi Cuenta VXEL",
    },
  },
};

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const saved = localStorage.getItem('vxel_lang') as Language;
  if (saved && ['fr', 'en', 'es'].includes(saved)) return saved;
  return 'fr';
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('vxel_lang', lang);
  window.dispatchEvent(new Event('vxel-settings-changed'));
}

export function getTranslations(lang?: Language): Translations {
  const currentLang = lang || getLanguage();
  return translations[currentLang] || translations.fr;
}
