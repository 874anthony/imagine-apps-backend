import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials!');

    const payload = { id: user._id, email: user.email, name: user.name };
    return {
      timestamp: new Date().toISOString(),
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(signUpDto: SignUpDto) {
    const user = await this.usersService.create(signUpDto);
    const payload = { id: user._id, email: user.email, name: user.name };
    return {
      timestamp: new Date().toISOString(),
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
