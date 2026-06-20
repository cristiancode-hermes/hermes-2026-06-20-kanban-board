import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Board } from '../boards/board.entity';
import { ColumnEntity } from '../columns/column.entity';
import { Card } from '../cards/card.entity';
import { Activity } from '../activities/activity.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async seed() {
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    const password = await bcrypt.hash('123456', 10);
    const ana = await this.userRepository.save(
      this.userRepository.create({
        email: 'ana@example.com',
        name: 'Ana Garcia',
        password,
      }) as DeepPartial<User>
    ) as unknown as User;
    const carlos = await this.userRepository.save(
      this.userRepository.create({
        email: 'carlos@example.com',
        name: 'Carlos Lopez',
        password,
      }) as DeepPartial<User>
    ) as unknown as User;
    console.log('Created users:', ana.email, carlos.email);

    const board1 = await this.boardRepository.save(
      this.boardRepository.create({
        name: 'Proyecto Alpha',
        description: 'Sprint inicial del proyecto Alpha',
        accentColor: 'blue',
        userId: ana.id,
      }) as DeepPartial<Board>
    ) as unknown as Board;

    const board1Cols = await this.columnRepository.save([
      this.columnRepository.create({ name: 'To Do', position: 0, boardId: board1.id, maxCards: null }) as DeepPartial<ColumnEntity>,
      this.columnRepository.create({ name: 'In Progress', position: 1, boardId: board1.id, maxCards: 5 }) as DeepPartial<ColumnEntity>,
      this.columnRepository.create({ name: 'Done', position: 2, boardId: board1.id, maxCards: null }) as DeepPartial<ColumnEntity>,
    ]) as unknown as ColumnEntity[];

    const board2 = await this.boardRepository.save(
      this.boardRepository.create({
        name: 'Diseno Web',
        description: 'Rediseno del sitio web corporativo',
        accentColor: 'emerald',
        userId: carlos.id,
      }) as DeepPartial<Board>
    ) as unknown as Board;

    const board2Cols = await this.columnRepository.save([
      this.columnRepository.create({ name: 'To Do', position: 0, boardId: board2.id, maxCards: null }) as DeepPartial<ColumnEntity>,
      this.columnRepository.create({ name: 'In Progress', position: 1, boardId: board2.id, maxCards: 3 }) as DeepPartial<ColumnEntity>,
      this.columnRepository.create({ name: 'Done', position: 2, boardId: board2.id, maxCards: null }) as DeepPartial<ColumnEntity>,
    ]) as unknown as ColumnEntity[];

    console.log('Created boards and columns');

    const cardType = Card as any;
    await this.cardRepository.save([
      { title: 'Configurar entorno de desarrollo', description: 'Instalar dependencias y configurar el proyecto', position: 0, column_id: board1Cols[0].id, board_id: board1.id, assignee_id: ana.id, due_date: new Date('2026-07-01'), labels: JSON.stringify(['setup', 'infra']) },
      { title: 'Disenar arquitectura de base de datos', description: 'Definir esquemas y relaciones', position: 1, column_id: board1Cols[0].id, board_id: board1.id, assignee_id: carlos.id, due_date: new Date('2026-07-05'), labels: JSON.stringify(['backend', 'database']) },
      { title: 'Implementar autenticacion JWT', description: 'Login, registro y middleware de autenticacion', position: 2, column_id: board1Cols[0].id, board_id: board1.id, assignee_id: ana.id, due_date: new Date('2026-07-10'), labels: JSON.stringify(['backend', 'auth']) },
      { title: 'Crear endpoints CRUD de usuarios', description: 'API REST para gestion de usuarios', position: 0, column_id: board1Cols[1].id, board_id: board1.id, assignee_id: carlos.id, due_date: new Date('2026-06-28'), labels: JSON.stringify(['backend', 'api']) },
      { title: 'Disenar mockups de UI', description: 'Prototipos en Figma para las pantallas principales', position: 1, column_id: board1Cols[1].id, board_id: board1.id, assignee_id: ana.id, due_date: new Date('2026-06-25'), labels: JSON.stringify(['design', 'ui']) },
      { title: 'Configurar pipeline CI/CD', description: 'Integracion continua con GitHub Actions', position: 0, column_id: board1Cols[2].id, board_id: board1.id, assignee_id: carlos.id, due_date: new Date('2026-06-20'), labels: JSON.stringify(['devops', 'ci']) },
      { title: 'Documentar API con Swagger', description: 'Documentacion de todos los endpoints', position: 1, column_id: board1Cols[2].id, board_id: board1.id, assignee_id: ana.id, due_date: new Date('2026-06-22'), labels: JSON.stringify(['docs', 'api']) },
    ]);

    await this.cardRepository.save([
      { title: 'Analizar sitio actual', description: 'Revisar el sitio web existente y recopilar feedback', position: 0, column_id: board2Cols[0].id, board_id: board2.id, assignee_id: carlos.id, due_date: new Date('2026-07-15'), labels: JSON.stringify(['research']) },
      { title: 'Crear guia de estilos', description: 'Paleta de colores, tipografia, componentes', position: 1, column_id: board2Cols[0].id, board_id: board2.id, assignee_id: ana.id, due_date: new Date('2026-07-20'), labels: JSON.stringify(['design', 'ui']) },
      { title: 'Maquetar landing page', description: 'HTML/CSS de la pagina principal', position: 2, column_id: board2Cols[0].id, board_id: board2.id, assignee_id: carlos.id, due_date: new Date('2026-07-25'), labels: JSON.stringify(['frontend', 'html']) },
      { title: 'Implementar responsive design', description: 'Adaptar diseno a dispositivos moviles', position: 0, column_id: board2Cols[1].id, board_id: board2.id, assignee_id: ana.id, due_date: new Date('2026-07-30'), labels: JSON.stringify(['frontend', 'responsive']) },
    ]);

    console.log('Created cards');

    await this.activityRepository.save([
      { board_id: board1.id, user_id: ana.id, action: 'created', entity_type: 'board', entity_id: board1.id, metadata: JSON.stringify({ name: 'Proyecto Alpha' }) },
      { board_id: board1.id, user_id: ana.id, action: 'created', entity_type: 'card', entity_id: 1, metadata: JSON.stringify({ title: 'Configurar entorno de desarrollo' }) },
      { board_id: board1.id, user_id: carlos.id, action: 'moved', entity_type: 'card', entity_id: 1, metadata: JSON.stringify({ fromColumnId: board1Cols[0].id, toColumnId: board1Cols[1].id }) },
      { board_id: board2.id, user_id: carlos.id, action: 'created', entity_type: 'board', entity_id: board2.id, metadata: JSON.stringify({ name: 'Diseno Web' }) },
      { board_id: board2.id, user_id: ana.id, action: 'updated', entity_type: 'card', entity_id: 1, metadata: JSON.stringify({ field: 'dueDate', before: null, after: '2026-07-15' }) },
    ]);

    console.log('Created activities');
    console.log('Seed completed successfully!');
  }
}
