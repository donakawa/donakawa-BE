export type CreateUserCommandProps = {
  email: string;
  password: string | null;
  nickname: string;
  goal: string | null;
};

export class CreateUserCommand {
  readonly email!: string;
  readonly password!: string | null;
  readonly nickname!: string;
  readonly goal!: string | null;

  constructor(props: CreateUserCommandProps) {
    this.email = props.email;
    this.password = props.password;
    this.nickname = props.nickname;
    this.goal = props.goal;
  }
}
