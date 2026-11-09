const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function main() {
  console.log('Populando banco de dados de Chamados...');

  await prisma.chamado.deleteMany();
  await prisma.user.deleteMany();

  const senhaHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      id: 1,
      nome: 'Carlos Técnico (Admin)',
      email: 'admin@chamados.com',
      password: senhaHash,
      role: 'ADMIN',
    },
  });

  const ana = await prisma.user.create({
    data: {
      id: 2,
      nome: 'Ana Souza',
      email: 'ana@chamados.com',
      password: senhaHash,
      role: 'USER',
    },
  });

  const bruno = await prisma.user.create({
    data: {
      id: 3,
      nome: 'Bruno Oliveira',
      email: 'bruno@chamados.com',
      password: senhaHash,
      role: 'USER',
    },
  });

  await prisma.chamado.createMany({
    data: [
      {
        id: 1,
        titulo: 'Computador do laboratório 2 não liga',
        problema: 'A máquina da bancada 4 apita três vezes ao apertar o botão power e não dá vídeo.',
        prioridade: 'ALTA',
        status: 'ABERTO',
        usuarioId: ana.id,
      },
      {
        id: 2,
        titulo: 'Erro ao acessar o Wi-Fi da biblioteca',
        problema: 'Meu notebook conecta na rede da escola, mas fica sem acesso à internet.',
        prioridade: 'MEDIA',
        status: 'EM_ANDAMENTO',
        respostaTecnica: 'Roteador do bloco B em análise pela equipe de TI.',
        usuarioId: ana.id,
      },
      {
        id: 3,
        titulo: 'Projetor da sala 3º AI com imagem piscando',
        problema: 'O cabo HDMI está com mau contato quando conectamos o notebook.',
        prioridade: 'ALTA',
        status: 'ABERTO',
        usuarioId: bruno.id,
      },
      {
        id: 4,
        titulo: 'Instalação do VS Code e Node.js',
        problema: 'Solicito atualização do Node.js nas máquinas da fileira C.',
        prioridade: 'BAIXA',
        status: 'FECHADO',
        respostaTecnica: 'Node.js atualizado nas máquinas da fileira C.',
        usuarioId: bruno.id,
      },
    ],
  });

  console.log('Seed finalizado! Usuários criados (senha: 123456):');
  console.log(' -', admin.email, '(ADMIN)');
  console.log(' -', ana.email, '(USER)');
  console.log(' -', bruno.email, '(USER)');
}

main()
  .catch((erro) => {
    console.error('Erro no seed:', erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
