import { BookOpen, Briefcase, GraduationCap, Handshake, Map, ShieldCheck, Target, Users } from 'lucide-react';

const programs = [
  {
    title: 'Entrée Express',
    icon: Target,
    text: 'Comprendre son admissibilité, son score potentiel, les documents clés et les actions prioritaires pour bâtir un profil compétitif.'
  },
  {
    title: 'Permis d’études',
    icon: GraduationCap,
    text: 'Structurer un projet d’études cohérent : choix du programme, preuves financières, parcours académique et justification du projet Canada.'
  },
  {
    title: 'Affaires et entrepreneuriat',
    icon: Briefcase,
    text: 'Explorer les opportunités d’affaires, clarifier le projet entrepreneurial et préparer les éléments stratégiques avant de s’engager.'
  }
];

const services = [
  'Analyse d’éligibilité et orientation personnalisée',
  'Consultation stratégique sur le projet Canada',
  'Choix de programme d’études ou d’immigration',
  'Révision et structuration des documents',
  'Préparation du plan d’action et des prochaines étapes',
  'Accompagnement dans la compréhension des exigences'
];

export default function Resources() {
  return (
    <div className="space-y-8">
      <section className="card-dark overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-white/5 pointer-events-none" />
        <div className="relative space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-capitune-border px-3 py-1 text-sm text-capitune-text">
            <BookOpen size={16} /> Ressources CAPITUNE
          </div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">Mieux comprendre, mieux préparer et mieux avancer dans votre projet Canada.</h2>
          <p className="text-capitune-text text-lg leading-relaxed">
            CAPITUNE met à disposition des ressources simples et pratiques pour présenter nos programmes, nos services de consultation et notre vision : offrir des conseils fiables, structurés et humains, inspirés par une expérience vécue du parcours Canada.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {programs.map((program) => {
          const Icon = program.icon;
          return (
            <div key={program.title} className="card-dark space-y-3">
              <div className="w-11 h-11 rounded-xl bg-capitune-gray border border-capitune-border flex items-center justify-center">
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-semibold">{program.title}</h3>
              <p className="text-capitune-text text-sm leading-relaxed">{program.text}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark space-y-4">
          <div className="flex items-center gap-3">
            <Handshake size={24} />
            <h3 className="text-2xl font-bold">Nos services de consultation</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {services.map((service) => (
              <div key={service} className="flex items-start gap-3 rounded-xl bg-capitune-gray/40 border border-capitune-border p-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm text-capitune-text">{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-dark space-y-4">
          <div className="flex items-center gap-3">
            <Map size={24} />
            <h3 className="text-2xl font-bold">Notre approche</h3>
          </div>
          <p className="text-capitune-text leading-relaxed">
            Nous croyons qu’un projet Canada ne doit pas commencer dans la confusion. Avant de payer des frais, remplir des formulaires ou prendre des décisions importantes, chaque personne mérite une lecture claire de sa situation, de ses options et des risques.
          </p>
          <p className="text-capitune-text leading-relaxed">
            Notre accompagnement repose sur l’écoute, la transparence et la structuration du dossier. Nous aidons le client à comprendre les exigences, à organiser ses informations et à avancer avec une stratégie réaliste.
          </p>
        </div>
      </section>

      <section className="card-dark space-y-4">
        <div className="flex items-center gap-3">
          <Users size={24} />
          <h3 className="text-2xl font-bold">Une vision née de l’expérience</h3>
        </div>
        <p className="text-capitune-text leading-relaxed">
          CAPITUNE est porté par une conviction : les meilleurs conseils sont ceux qui tiennent compte de la réalité du terrain, des démarches vécues, des erreurs à éviter et des attentes concrètes des personnes qui rêvent de bâtir un avenir au Canada.
        </p>
        <p className="text-capitune-text leading-relaxed">
          Notre objectif est d’apporter des consultations fiables, accessibles et responsables, afin que chaque client puisse prendre ses décisions avec plus de confiance et moins d’incertitude.
        </p>
      </section>
    </div>
  );
}
