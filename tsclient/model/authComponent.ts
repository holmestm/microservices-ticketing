import { AxiosInstance } from 'axios';
import { NextComponentType, NextPageContext } from 'next';
import { User } from './user';
export interface AuthComponentProps {
   context: NextPageContext,
   client: AxiosInstance,
   currentUser?: User
}
export declare type AuthComponentType = NextComponentType & {
   getInitialProps?(props: AuthComponentProps): any | Promise<any>;
};