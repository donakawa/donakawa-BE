export type CreateUserCommandProps = {
  email: string;
  password: string;
  nickname: string;
};

export class CreateUserCommand {
  readonly email!: string;
  readonly password!: string;
  readonly nickname!: string;

  constructor(props: CreateUserCommandProps) {
    this.email = props.email;
    this.password = props.password;
    this.nickname = props.nickname;
  }
}
