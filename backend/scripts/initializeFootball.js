// backend/scripts/initializeFootball.js
const mongoose = require('mongoose');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');

const MONGODB_URI = 'mongodb+srv://admin:4S83KNO1niY8iMqF@fortnite-wallet.kno3iq7.mongodb.net/fortnite-wallet?retryWrites=true&w=majority';

async function initializeFootball() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Equipos de Liga A
    const teamsLigaA = [
      { name: 'Real Madrid CF', shield: '⚪', league: 'A' },
      { name: 'FC Barcelona', shield: '🔵', league: 'A' },
      { name: 'Atlético Madrid', shield: '🔴', league: 'A' },
      { name: 'Sevilla FC', shield: '🔴', league: 'A' },
      { name: 'Valencia CF', shield: '🦇', league: 'A' },
      { name: 'Athletic Bilbao', shield: '🦁', league: 'A' },
      { name: 'Real Sociedad', shield: '🔵', league: 'A' },
      { name: 'Villarreal CF', shield: '🟡', league: 'A' },
      { name: 'Real Betis', shield: '🟢', league: 'A' },
      { name: 'Celta de Vigo', shield: '⚪', league: 'A' },
      { name: 'Espanyol', shield: '🔵', league: 'A' },
      { name: 'Getafe CF', shield: '🔵', league: 'A' },
      { name: 'Granada CF', shield: '🔴', league: 'A' },
      { name: 'Levante UD', shield: '🔵', league: 'A' },
      { name: 'Osasuna', shield: '🔴', league: 'A' },
      { name: 'Deportivo Alavés', shield: '🔵', league: 'A' },
      { name: 'Mallorca', shield: '🔴', league: 'A' },
      { name: 'Cádiz CF', shield: '🟡', league: 'A' },
      { name: 'Elche CF', shield: '🟢', league: 'A' },
      { name: 'Rayo Vallecano', shield: '⚡', league: 'A' }
    ];

    // Equipos de Liga B
    const teamsLigaB = [
      { name: 'CD Leganés', shield: '🔵', league: 'B' },
      { name: 'Real Zaragoza', shield: '⚪', league: 'B' },
      { name: 'Sporting Gijón', shield: '🔴', league: 'B' },
      { name: 'Real Oviedo', shield: '🔵', league: 'B' },
      { name: 'CD Tenerife', shield: '⚪', league: 'B' },
      { name: 'Málaga CF', shield: '🔵', league: 'B' },
      { name: 'UD Las Palmas', shield: '🟡', league: 'B' },
      { name: 'SD Eibar', shield: '🔴', league: 'B' },
      { name: 'CD Mirandés', shield: '🔴', league: 'B' },
      { name: 'Ponferradina', shield: '⚪', league: 'B' },
      { name: 'FC Cartagena', shield: '⚪', league: 'B' },
      { name: 'Real Valladolid', shield: '🟣', league: 'B' },
      { name: 'Girona FC', shield: '🔴', league: 'B' },
      { name: 'CD Lugo', shield: '🔴', league: 'B' },
      { name: 'Albacete BP', shield: '⚪', league: 'B' },
      { name: 'Burgos CF', shield: '⚪', league: 'B' },
      { name: 'SD Huesca', shield: '🔵', league: 'B' },
      { name: 'SD Amorebieta', shield: '⚪', league: 'B' },
      { name: 'FC Andorra', shield: '🟡', league: 'B' },
      { name: 'Villarreal B', shield: '🟡', league: 'B' }
    ];

    const allTeams = [...teamsLigaA, ...teamsLigaB];

    console.log('🏟️  Creando equipos...');
    
    for (const teamData of allTeams) {
      const existing = await Team.findOne({ name: teamData.name });
      if (!existing) {
        const team = new Team({
          ...teamData,
          budget: Math.floor(Math.random() * 100000) + 50000,
          isNPC: true
        });
        await team.save();

        // Generar plantilla
        await generateTeamSquad(team._id, teamData.league);
      }
    }

    console.log('✅ Equipos creados');

    // Generar calendario de Liga A
    console.log('📅 Generando calendario Liga A...');
    await generateLeagueFixtures('A', '2024-25');

    // Generar calendario de Liga B
    console.log('📅 Generando calendario Liga B...');
    await generateLeagueFixtures('B', '2024-25');

    console.log('✅ Todo inicializado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function generateTeamSquad(teamId, league) {
  const positions = [
    { pos: 'POR', count: 3 },
    { pos: 'DEF', count: 8 },
    { pos: 'MED', count: 8 },
    { pos: 'DEL', count: 6 }
  ];

  const baseOverall = league === 'A' ? 70 : 60;
  const nationalities = ['🇦🇷', '🇧🇷', '🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇵🇹', '🇬🇧', '🇺🇾', '🇨🇴'];
  const firstNames = ['Juan', 'Pedro', 'Luis', 'Carlos', 'Miguel', 'David', 'Jose', 'Diego', 'Mateo', 'Lucas', 'Daniel', 'Rafael', 'Antonio'];
  const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Silva', 'Torres', 'Romero', 'Díaz'];

  for (const posData of positions) {
    for (let i = 0; i < posData.count; i++) {
      const overall = Math.floor(Math.random() * 15) + baseOverall;

      const player = new Player({
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        position: posData.pos,
        age: Math.floor(Math.random() * 15) + 18,
        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        overall: overall,
        pace: Math.min(99, Math.max(40, overall + Math.floor(Math.random() * 20) - 10)),
        shooting: Math.min(99, Math.max(40, overall + Math.floor(Math.random() * 20) - 10)),
        passing: Math.min(99, Math.max(40, overall + Math.floor(Math.random() * 20) - 10)),
        defending: Math.min(99, Math.max(40, overall + Math.floor(Math.random() * 20) - 10)),
        physical: Math.min(99, Math.max(40, overall + Math.floor(Math.random() * 20) - 10)),
        currentTeam: teamId
      });

      await player.save();
    }
  }

  // Algunos jugadores al mercado
  const teamPlayers = await Player.find({ currentTeam: teamId });
  const playersToMarket = teamPlayers.slice(20, 25);
  
  for (const player of playersToMarket) {
    player.onMarket = true;
    player.transferPrice = Math.floor(player.marketValue * (0.8 + Math.random() * 0.4));
    await player.save();
  }
}

async function generateLeagueFixtures(league, season) {
  const teams = await Team.find({ league });
  
  if (teams.length !== 20) {
    console.log(`⚠️  Liga ${league} no tiene 20 equipos`);
    return;
  }

  // Generar calendario de ida (jornadas 1-19)
  for (let matchday = 1; matchday <= 19; matchday++) {
    const matches = [];
    
    for (let i = 0; i < 10; i++) {
      const homeIndex = (matchday + i) % 20;
      const awayIndex = (20 - i + matchday - 1) % 20;
      
      if (homeIndex !== awayIndex) {
        matches.push({
          season,
          matchday,
          league,
          homeTeam: teams[homeIndex]._id,
          awayTeam: teams[awayIndex]._id
        });
      }
    }

    await Match.insertMany(matches);
  }

  // Generar calendario de vuelta (jornadas 20-38)
  const firstLegMatches = await Match.find({ season, league, matchday: { $lte: 19 } });
  
  for (const match of firstLegMatches) {
    await Match.create({
      season,
      matchday: match.matchday + 19,
      league,
      homeTeam: match.awayTeam,
      awayTeam: match.homeTeam
    });
  }
}

initializeFootball();