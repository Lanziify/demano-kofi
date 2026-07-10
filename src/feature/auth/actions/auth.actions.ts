import { safeCatch } from '@/lib/errors/safe-catch';
import { auth } from '@/utils/auth';
import { AuthRepository } from '../repository/auth.repository';
import { APP_ROLES } from '@/lib/auth/roles';
import { actionErrorParser } from '@/lib/errors/action-error-parser';
import { ApiBody } from '@/types/api';

export type SignUpEmailBody = ApiBody<typeof auth.api.signUpEmail>
export type SignInEmailBody = ApiBody<typeof auth.api.signInEmail>

export async function createAdminAction(values: SignUpEmailBody) {
  return await safeCatch(
    async () => {
      const response = await auth.api.signUpEmail({
        body: values,
      });

      const authRepository = new AuthRepository();
      await authRepository.setUserRole(response.user.id, APP_ROLES.admin);

      return response;
    },
    { parser: actionErrorParser }
  );
}

export const createUserAction = async (values: SignUpEmailBody) => {
  return await safeCatch(
    async () => {
      return await auth.api.signUpEmail({
        body: values,
        returnHeaders: true,
      });
    },
    { parser: actionErrorParser }
  );
};