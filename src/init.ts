import {createInitialAdminAccount} from './services/adminService.ts';

export const init = async () => {
    await createInitialAdminAccount();
}