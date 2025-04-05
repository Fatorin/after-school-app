export interface Me {
  id: string,
  username: string,
  name: string,
  role: 'super_admin' | 'admin' | 'user',
  exp: number,
}