import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn } from "typeorm"
import { Role } from "../common/enums/role.enum"
import { Sex } from "../common/enums/sex.enum"

@Entity("users")
export class User {
  @ObjectIdColumn() _id: ObjectId
  @Column() ownerEmail: string
  @Column() email: string
  @Column() name: string
  @Column() provider: string
  @Column() picture: string
  @Column() sex: Sex
  @Column() roles: Role[] = [Role.SCOUTER]
  @Column() zeroProba = { a: Array(11).fill(0) }
  @Column() firstProba = {
    a: Array(11).fill(0),
    b: Array(7).fill(0),
    c: Array(4).fill(0),
    d: Array(6).fill(0),
    e: Array(10).fill(0),
    f: Array(9).fill(0),
    g: Array(4).fill(0),
    h: Array(7).fill(0),
  }
  @Column() secondProba = {
    a: Array(10).fill(0),
    b: Array(10).fill(0),
    c: Array(3).fill(0),
    d: Array(7).fill(0),
    e: Array(9).fill(0),
    f: Array(2).fill(0),
    g: Array(1).fill(0),
  }
  @CreateDateColumn() createdAt: Date
  @Column() password: string

  constructor(user?: Partial<User>) {
    Object.assign(this, user)
  }
}
