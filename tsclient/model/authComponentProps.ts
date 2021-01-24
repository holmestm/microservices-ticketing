import { AxiosInstance } from 'axios';
import { NextPageContext } from 'next';
import { User } from './user';
export interface AuthComponentProps {
   context: NextPageContext,
   client: AxiosInstance,
   currentUser?: User
}