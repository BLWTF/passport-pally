import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'state',
})
export default class AppStateEntity {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: 1;

  @Column('text')
  state: string;
}
