export type CreateUserCommandProps = {
  email: string;
  password: string | null;
  nickname: string;
  goal: string;
};

export class CreateUserCommand {
  readonly email!: string;
  readonly password!: string | null;
  readonly nickname!: string;
  readonly goal!: string;

  constructor(props: CreateUserCommandProps) {
    this.email = props.email;
    this.password = props.password;
    this.nickname = props.nickname;
    this.goal = props.goal;
  }
}
