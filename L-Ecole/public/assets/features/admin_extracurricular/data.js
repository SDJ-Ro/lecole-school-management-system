/* =========================================================================
   L'ÉCOLE ADMIN — EXTRACURRICULAR PAGE — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for Extracurriculars & Clubs.
   When linking a backend database later, fetch('/api/extracurriculars/...')
   calls will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.EXTRACURRICULAR_MOCK_DATA = (function () {
  'use strict';

  function unsplash(id) {
    return `https://images.unsplash.com/photo-${id}?w=100&h=100&fit=crop&crop=faces`;
  }

  const TYPE_LABELS = {
    Sports: { teamWord: 'Teams', memberWord: 'Players' },
    Society: { teamWord: 'Squads', memberWord: 'Members' },
    Club: { teamWord: 'Groups', memberWord: 'Members' },
    Arts: { teamWord: 'Sections', memberWord: 'Performers' }
  };

  const STATUS_BADGE_CLASS = {
    Active: 'c-status-badge--active',
    'Recruitment Open': 'c-status-badge--open',
    'Maintenance Mode': 'c-status-badge--maintenance',
    Pending: 'c-status-badge--pending'
  };

  const CALENDAR_VOCAB = {
    Sports: { fixture: 'Match', tournament: 'Tournament' },
    Society: { fixture: 'Session', tournament: 'Competition' },
    Club: { fixture: 'Session', tournament: 'Competition' },
    Arts: { fixture: 'Rehearsal', tournament: 'Performance' }
  };

  const EXTRACURRICULARS = [
    {
      id: 1, name: 'Varsity Football Club', type: 'Sports', category: 'Athletics',
      desc: 'Competitive league training and internal tournaments for senior grades.',
      status: 'Active',
      createdAt: '15 Jan 2024',
      image: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce1548?w=800&h=400&fit=crop',
      tic: { name: 'Mr. Weerasinghe', avatar: unsplash('1500648767791-00dcc994a43e'), email: 'weerasinghe@lecole.edu', subject: 'Physical Education' },
      coach: { name: 'Coach Dinesh', avatar: unsplash('1568602471122-7832951cc4c5'), phone: '+94 77 123 4567', specialty: 'UEFA B Licensed' },
      positions: [
        { title: 'Captain', showOnCard: true },
        { title: 'Vice Captain', showOnCard: true },
        { title: 'Goalkeeper Lead', showOnCard: false }
      ],
      ageGroups: ['Under 15', 'Under 19'],
      ageGroupLimit: 30, teamLimit: 11,
      unassignedStudents: [
        { id: 'u1', name: 'Sahan Peiris', grade: 'Grade 11', avatar: unsplash('1524504388940-b1c1722653e1'), ageGroup: 'Under 19' },
        { id: 'u2', name: 'Kushan Silva', grade: 'Grade 9', avatar: unsplash('1438761681033-6461ffad8d80'), ageGroup: 'Under 15' },
        { id: 'u3', name: 'Hasindu Bandara', grade: 'Grade 11', avatar: unsplash('1507003211169-0a1dd7228f2d'), ageGroup: 'Under 19' }
      ],
      teams: [
        { name: 'Team A (Senior)', ageGroup: 'Under 19', roster: [
          { id: 'r1', name: 'Kavindu Perera', grade: 'Grade 11', avatar: unsplash('1534528741775-53994a69daeb'), position: 'Captain / Striker' },
          { id: 'r2', name: 'Sanjula Silva', grade: 'Grade 11', avatar: unsplash('1506794778202-cad84cf45f1d'), position: 'Vice Captain / Midfield' },
          { id: 'r3', name: 'Isuru Bandara', grade: 'Grade 11', avatar: unsplash('1507003211169-0a1dd7228f2d'), position: 'Goalkeeper' }
        ] },
        { name: 'Team B (Junior)', ageGroup: 'Under 15', roster: [
          { id: 'r4', name: 'Ravindu Alwis', grade: 'Grade 9', avatar: unsplash('1527980965255-d3b416303d12'), position: 'Defender' },
          { id: 'r5', name: 'Tharindu Jay', grade: 'Grade 10', avatar: unsplash('1438761681033-6461ffad8d80'), position: 'Winger' }
        ] }
      ],
      notices: [
        { title: 'New training kit distribution', date: 'Oct 22, 2024', body: 'Collect the new season kit from the sports office before Friday.' },
        { title: 'Fitness assessment week', date: 'Oct 18, 2024', body: 'Mandatory fitness screening for all Team A & B players.' }
      ],
      fixtures: [
        { title: 'vs. St. Thomas College', date: 'Oct 28, 2024', venue: 'Away — SSC Grounds', meta: 'Away' },
        { title: 'vs. Royal College', date: 'Nov 04, 2024', venue: 'Home — Main Grounds', meta: 'Home' },
        { title: 'vs. Wesley College', date: 'Oct 12, 2024', venue: 'Home — Main Grounds', meta: 'Home', result: 'Won 3–1' }
      ],
      tournaments: [{ title: 'U19 Inter-School Championship', date: 'Dec 2024', venue: 'Colombo', meta: 'Provincial' }],
      awards: [
        {
          title: 'Div-1 League Runners Up', year: '2023', level: 'Provincial', kind: 'Team',
          date: 'Nov 18, 2023', tournament: 'Provincial Div-1 Football League',
          tournamentType: 'League (Round Robin + Playoffs)', scope: 'Provincial',
          organisedBy: 'Western Province Schools Football Association', ageGroup: 'Under 19',
          place: 'Runners Up', colours: 'Silver Medal', teamName: 'Team A (Senior)', venue: 'SSC Grounds, Colombo',
          image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=400&fit=crop',
          gallery: [
            'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&fit=crop'
          ],
          participants: ['Kavindu Perera', 'Sanjula Silva', 'Isuru Bandara', 'Ravindu Alwis', 'Tharindu Jay'],
          details: 'A 10-team provincial league contested over the season. The squad finished top of the group stage before falling narrowly in the final, 2–1 after extra time.',
          bio: 'After an undefeated group stage, the senior squad battled through a tense semi-final on penalties to reach the provincial final. Despite a spirited comeback, the team finished as runners up — the club’s best league result in over a decade.'
        },
        {
          title: 'Best Striker of the Season', year: '2023', level: 'Inter-School', kind: 'Individual',
          recipient: 'Kavindu Perera', date: 'Dec 02, 2023', tournament: 'Inter-School Football Circuit',
          tournamentType: 'Individual Award', scope: 'Inter-School', organisedBy: 'Inter-School Football Circuit Committee',
          ageGroup: 'Under 19', place: 'Season Award', colours: 'Gold Medal', teamName: 'Team A (Senior)', venue: 'Colombo',
          participants: ['Kavindu Perera'],
          details: 'Awarded to the highest-scoring player across the inter-school circuit, judged on goals, assists and overall contribution.',
          bio: 'Kavindu topped the scoring charts with 18 goals in 14 matches, earning the season’s Best Striker recognition and a call-up to the provincial youth pool.'
        }
      ]
    },
    {
      id: 2, name: 'Digital Arts Collective', type: 'Arts', category: 'Creative Arts',
      desc: 'Exploring digital media, graphic design, 3D modelling, and animation.',
      status: 'Pending',
      createdAt: '22 Oct 2024',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop',
      tic: { name: 'Mr. Silva', avatar: unsplash('1500648767791-00dcc994a43e'), email: 'silva.art@lecole.edu', phone: '+94 77 555 1234', subject: 'Art & Design' },
      positions: [{ title: 'Creative Director', showOnCard: true }, { title: 'Lead Designer', showOnCard: true }],
      teams: [], notices: [], fixtures: [], tournaments: [], awards: []
    }
  ];

  return {
    unsplash,
    TYPE_LABELS,
    STATUS_BADGE_CLASS,
    CALENDAR_VOCAB,
    EXTRACURRICULARS
  };
})();
