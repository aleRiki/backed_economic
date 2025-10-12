import { Request } from 'express';
import { User } from 'src/users/entities/user.entity'; // o donde tengas tu entidad User

export interface RequestWithUser extends Request {
  user: User;
}
