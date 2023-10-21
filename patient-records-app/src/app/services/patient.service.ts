import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all patients based on the specified search model.
   *
   * @param {any} searchModel - The search model used to filter the patients.
   * @return {Observable<Patient[]>} An observable that emits an array of Patient objects.
   */
  getAllPatients(searchModel: any): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl, { params: searchModel })
  }

  /**
   * Updates a patient.
   *
   * @param {Patient} patient - The patient object to update.
   * @return {Observable<any>} - An observable that emits the response from the server.
   */
  updatePatient(patient: Patient): Observable<any> {
    const url = `${this.apiUrl}/${patient.id}`;
    return this.http.put<string>(url, patient, { responseType: 'text' as 'json' });
  }

  /**
   * Uploads patient data to the API endpoint.
   *
   * @param {FormData} formData - The data to be uploaded.
   * @return {Observable<string>} - A string representing the response from the API.
   */
  uploadPatientData(formData: FormData): Observable<string> {
    const url = `${this.apiUrl}/upload`;
    return this.http.post<string>(url, formData, { responseType: 'text' as 'json' });
  }
}
