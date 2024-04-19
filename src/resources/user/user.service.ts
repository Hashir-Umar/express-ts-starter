import PasswordHelper from '../auth/auth.helper';
import User, { IUser } from '../../infra/model/user.model';
import { Throw400 } from '../../utils/exceptions/http.exception';
import VError from 'verror';
import BaseService from '../base/base.service';

class UserService extends BaseService<IUser> {
    model = User;
}

export default UserService;
