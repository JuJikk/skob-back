import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm"

@Entity("invites")
export class Invite {
  @ObjectIdColumn() _id: ObjectId
  @Column() foremanEmail: string
  @Column() scoutEmail: string
  @Column() hash: string
  @Column() expires: Date

  constructor(invite?: Partial<Invite>) {
    Object.assign(this, invite)
  }
}
