export enum Gender {
  Male = 0,
  Female = 1
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  birthday: Date;
  gender: number;

  // Add the 'editing' property
  editMode?: boolean;
}
