import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/schema/user.schema';
import { Response } from 'express';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const expiresAccessToken = new Date();
    // expiresAccessToken.setMilliseconds(
    //   expiresAccessToken.getTime() +
    //     parseInt(
    //       this.configService.getOrThrow<string>(
    //         'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    //       ),
    //     ),
    // );
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: await hash(refreshToken, 10) } },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
  }

  async logout(user: User, response: Response) {
    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: null } },
    );
    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) throw new UnauthorizedException();

      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }
  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({
        _id: userId,
      });
      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) throw new UnauthorizedException();

      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }
}
