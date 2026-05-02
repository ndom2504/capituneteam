import { Globe, Shield, Users, TrendingUp, Heart, Rocket, Target, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  { icon: Users, title: 'Accompagnement humain', desc: 'Nous croyons qu\'un projet d\'immigration est avant tout une aventure humaine. Chaque membre est écouté, compris et accompagné.' },
  { icon: Shield, title: 'Transparence et confiance', desc: 'Des processus clairs, des informations fiables et une communication honnête à chaque étape.' },
  { icon: TrendingUp, title: 'Excellence et professionnalisme', desc: 'Nous collaborons avec des conseillers engagés à offrir des services de qualité, adaptés à chaque profil.' },
  { icon: Heart, title: 'Inclusion et diversité', desc: 'CAPITUNE valorise toutes les origines, cultures et parcours, comme une richesse pour la communauté canadienne.' },
  { icon: Rocket, title: 'Ambition collective', desc: 'La réussite individuelle nourrit une communauté forte, inspirante et solidaire.' },
];

const visionPoints = [
  'Créer un écosystème de confiance entre clients, conseillers et partenaires',
  'Faciliter l\'accès aux opportunités canadiennes (immigration, études, affaires, emploi)',
  'Valoriser les histoires de réussite et l\'entraide',
  'Faire de CAPITUNE une référence communautaire pour toute personne souhaitant s\'installer ou s\'épanouir au Canada',
];

export default function About() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Globe className="w-10 h-10" />
          <h1 className="text-4xl font-bold tracking-tight">CAPITUNE</h1>
        </div>
        <p className="text-xl text-capitune-text">Votre passerelle vers l'expérience canadienne</p>
        <p className="text-lg font-medium max-w-2xl mx-auto">
          Construisons ensemble votre avenir au Canada
        </p>
      </div>

      {/* Mission */}
      <div className="card-dark max-w-3xl mx-auto">
        <p className="text-capitune-text leading-relaxed text-lg">
          CAPITUNE est une plateforme dédiée à celles et ceux qui souhaitent vivre, étudier,
          travailler ou entreprendre au Canada. Ici, votre projet prend forme, accompagné par des
          conseillers, une communauté engagée et une vision commune : faire du rêve canadien
          une réalité concrète et partagée.
        </p>
      </div>

      {/* Company info */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-capitune-text" />
          <h2 className="text-2xl font-bold">À propos de CAPITUNE</h2>
        </div>
        <div className="card-dark space-y-4">
          <p className="text-capitune-text leading-relaxed">
            CAPITUNE est un projet de l'entreprise <strong className="text-capitune-white">Export Monde Prestige inc.</strong>,
            fondée en 2023 à Sherbrooke, Québec.
          </p>
          <p className="text-capitune-text leading-relaxed">
            La plateforme a été créée dans le but de promouvoir la destination Canada auprès des personnes
            désireuses de bénéficier :
          </p>
          <ul className="space-y-2 text-capitune-text">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
              de l'expérience canadienne
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
              du potentiel des affaires
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
              des offres de formation
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
              des opportunités d'emploi
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
              et d'un cadre de vie stable et inclusif
            </li>
          </ul>
          <p className="text-capitune-text leading-relaxed">
            CAPITUNE agit comme un pont entre les ambitions internationales et les opportunités canadiennes,
            en mettant l'humain, l'encadrement et la transparence au cœur de chaque démarche.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Nos valeurs fondamentales</h2>
        <div className="grid gap-4">
          {values.map((v, i) => (
            <div key={i} className="card-dark flex items-start gap-4 group hover:border-capitune-white transition">
              <div className="p-2 bg-capitune-gray rounded-lg group-hover:bg-capitune-border transition">
                <v.icon className="w-6 h-6 text-capitune-text group-hover:text-capitune-white transition" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-capitune-text">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-capitune-text" />
          <h2 className="text-2xl font-bold">Notre vision</h2>
        </div>
        <div className="card-dark space-y-4">
          <p className="text-lg font-medium">
            Bâtir une communauté engagée, solidaire et ambitieuse, unie par la volonté de réaliser
            le rêve canadien et de le partager avec d'autres.
          </p>
          <p className="text-capitune-text">Nous aspirons à :</p>
          <ul className="space-y-3">
            {visionPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <Rocket className="w-4 h-4 mt-1 text-capitune-text shrink-0" />
                <span className="text-capitune-text">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Slogans */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold">CAPITUNE</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {['Le Canada commence ici', 'Votre projet, notre engagement', 'Ensemble vers le rêve canadien', 'Une communauté, un avenir au Canada'].map((slogan, i) => (
            <span key={i} className="card-dark text-sm font-medium">{slogan}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-capitune-text">
          Rejoignez la communauté CAPITUNE et commencez votre aventure canadienne dès aujourd'hui.
        </p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2">
          Rejoindre CAPITUNE
        </Link>
      </div>
    </div>
  );
}

