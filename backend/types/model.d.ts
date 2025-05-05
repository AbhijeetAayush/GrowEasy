export interface Campaign {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
    leads: string[];
    accountIDs: string[];
  }
  
  export interface MessageResult {
    taskId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    message?: string;
  }
  
  export interface Profile {
    profileId: string;
    fullName: string;
    jobTitle: string;
    company: string;
    location: string;
    profileUrl: string;
  }