export interface Student {
  id: string;
  name: string;
  gender?: number;
  id_number?: string;
  date_of_birth?: Date;
  school_name?: string;
  grade?: string;
  is_pg?: boolean;
  description?: string;
  family_type?: string;
  family_members?: number;
  breadwinner?: string;
  occupation?: string;
  subsidy?: string;
  address?: string;
  home_ownership?: string;
  home_phone_number?: string;
  mobile_phone_number?: string;
  chinese_book?: string,
  english_book?: string,
  math_book?: string,
  science_book?: string,
  social_studies_book?: string,
  line_id?: string;
  comment?: string;
  joined_at: string;
}

export interface StudentUpsertReq {
  name: string;
  gender?: number;
  id_number?: string;
  date_of_birth?: Date;
  school_name?: string;
  grade?: string;
  is_pg?: boolean;
  description?: string;
  family_type?: string;
  family_members?: number;
  breadwinner?: string;
  occupation?: string;
  subsidy?: string;
  address?: string;
  home_ownership?: string;
  home_phone_number?: string;
  mobile_phone_number?: string;
  chinese_book?: string,
  english_book?: string,
  math_book?: string,
  science_book?: string,
  social_studies_book?: string,
  line_id?: string;
  comment?: string;
  joined_at: string;
}