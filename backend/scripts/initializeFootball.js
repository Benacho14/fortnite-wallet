// backend/scripts/initFootball.js
// Ejecutar este script UNA VEZ para crear los equipos NPC de ambas ligas

const mongoose = require('mongoose');
const Team = require('../models/Team');
const Player = require('../models/Player');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fortnite-wallet';

const teamNamesLeagueA = [
  'Real Madrid', 'Barcelona', 'Atlético', 'Valencia', 'Sevilla',
  'Villarreal', 'Real Betis', 'Athletic Club', 'Real Sociedad', 'Celta',
  'Espanyol', 'Getafe', 'Osasuna', 'Granada', 'Levante',
  'Alavés', 'Valladolid', 'Eibar', 'Mallorca', 'Cádiz'
];

const teamNamesLeagueB = [
  'Sporting', 'Zaragoza', 'Málaga', 'Oviedo', 'Tenerife',
  'Las Palmas', 'Almería', 'Mirandés', 'Cartagena', 'Burgos',
  'Ponferradina', 'Lugo', 'Fuenlabrada', 'Sabadell', 'Alcorcón',
  'Leganés', 'Castellón', 'Girona', 'Huesca', 'Elche'
];

async function initFootball() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Conectado a MongoDB');

    // Verificar si ya existen equipos
    const existingTeams = await Team.countDocuments();
    if (existingTeams > 0) {
      console.log('⚠️ Ya existen equipos en la base de datos');
      console.log('Si quieres reiniciar, elimina primero todos los equipos');
      process.exit(0);
    }

    console.log('🏗️ Creando equipos de Liga A...');
    for (const teamName of teamNamesLeagueA) {
      const team = new Team({
        name: teamName,
        league: 'A',
        budget: Math.floor(Math.random() * 100000) + 50000,
        isNPC: true
      });
      await team.save();
      await generateSquad(team._id, 70, 85); // Jugadores entre 70-85 overall
      console.log(`✅ ${teamName} creado`);
    }

    console.log('🏗️ Creando equipos de Liga B...');
    for (const teamName of teamNamesLeagueB) {
      const team = new Team({
        name: teamName,
        league: 'B',
        budget: Math.floor(Math.random() * 50000) + 30000,
        isNPC: true
      });
      await team.save();
      await generateSquad(team._id, 55, 70); // Jugadores entre 55-70 overall
      console.log(`✅ ${teamName} creado`);
    }

    console.log('🎉 ¡Football Manager inicializado correctamente!');
    console.log(`📊 ${teamNamesLeagueA.length} equipos en Liga A`);
    console.log(`📊 ${teamNamesLeagueB.length} equipos en Liga B`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar:', error);
    process.exit(1);
  }
}

async function generateSquad(teamId, minOverall, maxOverall) {
  const positions = [
    { pos: 'GK', count: 2 },
    { pos: 'DEF', count: 6 },
    { pos: 'MID', count: 6 },
    { pos: 'ATK', count: 4 }
  ];

  for (const { pos, count } of positions) {
    for (let i = 0; i < count; i++) {
      const overall = Math.floor(Math.random() * (maxOverall - minOverall + 1)) + minOverall;
      
      const player = new Player({
        name: generateRandomName(),
        position: pos,
        age: Math.floor(Math.random() * 13) + 18,
        overall,
        pace: generateStat(overall, pos, 'pace'),
        shooting: generateStat(overall, pos, 'shooting'),
        passing: generateStat(overall, pos, 'passing'),
        dribbling: generateStat(overall, pos, 'dribbling'),
        defending: generateStat(overall, pos, 'defending'),
        physical: generateStat(overall, pos, 'physical'),
        teamId,
        isNPC: true
      });

      player.calculateMarketValue();
      await player.save();
    }
  }
}

function generateStat(overall, position, statType) {
  const base = overall + Math.floor(Math.random() * 10) - 5;
  
  // Modificadores por posición
  if (position === 'GK') {
    if (['defending', 'physical'].includes(statType)) return Math.min(99, base + 5);
  } else if (position === 'DEF') {
    if (['defending', 'physical'].includes(statType)) return Math.min(99, base + 8);
    if (statType === 'shooting') return Math.max(40, base - 10);
  } else if (position === 'MID') {
    if (['passing', 'dribbling'].includes(statType)) return Math.min(99, base + 8);
  } else if (position === 'ATK') {
    if (['shooting', 'pace', 'dribbling'].includes(statType)) return Math.min(99, base + 8);
    if (statType === 'defending') return Math.max(30, base - 15);
  }
  
  return Math.max(30, Math.min(99, base));
}

function generateRandomName() {
  const firstNames = [
    'Carlos', 'Juan', 'Diego', 'Luis', 'Pedro', 'Miguel', 'Andrés', 'Fernando', 
    'Jorge', 'Ricardo', 'Manuel', 'Antonio', 'José', 'Francisco', 'Rafael',
    'Javier', 'Sergio', 'Pablo', 'Daniel', 'Alejandro', 'David', 'Ángel',
    'Roberto', 'Mario', 'Alberto', 'Cristian', 'Iván', 'Adrián', 'Rubén'
  ];
  
  const lastNames = [
    'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'Sánchez',
    'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales',
    'Reyes', 'Jiménez', 'Hernández', 'Ruiz', 'Vargas', 'Castro', 'Ortiz',
    'Silva', 'Ramos', 'Medina', 'Romero', 'Delgado', 'Aguilar', 'Vega'
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

initFootball();