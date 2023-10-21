import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PatientService } from '../../services/patient.service';
import { Gender, Patient } from '../../models/patient.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  animations: [
    trigger('buttonVisibility', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('hidden <=> visible', animate('300ms ease-in-out')),
    ]),
  ],
})
export class PatientListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  Gender = Gender;

  displayedColumns: string[] = ['firstName', 'lastName', 'birthday', 'gender', 'actions'];
  dataSource = new MatTableDataSource<Patient>();

  genderOptions = [
    { value: Gender.Male, viewValue: 'Male' },
    { value: Gender.Female, viewValue: 'Female' }
  ];

  constructor(private patientService: PatientService,
    private snackBar: MatSnackBar) {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'birthday': return new Date(item.birthday).getTime();
        default: return (item as any)[property];
      }
    };
  }

  /**
   * Initializes the component and fetches the patients.
   */
  ngOnInit() {
    this.fetchPatients();
  }

  /**
   * Initializes the component after the view is fully rendered.
   *
   * No parameters are required.
   *
   * There is no return value.
   */
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

    /**
   * Applies a filter to the data source based on the provided event.
   *
   * @param {Event} event - The event that triggered the filter.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Discards the edit made to a patient.
   *
   * @param {Patient} patient - The patient object that needs to have its edit discarded.
   * @return {void} This function does not return a value.
   */
  discardEdit(patient: Patient): void {
    // For simplicity, we will fetch the data again. Ideally, you might want to store a backup of the row data.
    this.fetchPatients();
  }

  /**
   * Fetches the list of patients from the server and updates the data source.
   *
   * @return {void} This function does not return a value.
   */
  fetchPatients() {
    this.patientService.getAllPatients({}).subscribe(data => {
      // Convert birthday strings to Date objects
      data.forEach(patient => {
        patient.birthday = new Date(patient.birthday);
      });
      this.dataSource.data = data;
    });
  }

  /**
   * Retrieves the display value of a gender based on its numeric value.
   *
   * @param {number} genderValue - The numeric value of the gender.
   * @return {string} The display value of the gender.
   */
  getGenderDisplayValue(genderValue: number): string {
    return Gender[genderValue];
  }

  /**
   * Handles the event when a file is selected.
   *
   * @param {any} event - The event object.
   * @return {void} This function does not return anything.
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  /**
   * Uploads a file.
   *
   * @param {File} file - The file to be uploaded.
   * @return {void} This function does not return anything.
   */
  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('CsvFile', file);

    this.patientService.uploadPatientData(formData).subscribe(response => {
      this.snackBar.open('Patients uploaded successfully!', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
      this.fetchPatients();
    }, error => {
      this.snackBar.open('Error uploading patients! Please verify the data is correct.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
    });
  }

  /**
   * Starts the edit mode for a patient.
   *
   * @param {Patient} patient - The patient to start editing.
   * @return {void} This function does not return anything.
   */
  startEdit(patient: Patient): void {
    patient.editMode = true;
  }

  /**
   * Saves the edited patient information.
   *
   * @param {Patient} patient - The patient object containing the updated information.
   * @return {void} This function does not return anything.
   */
  saveEdit(patient: Patient): void {
    this.patientService.updatePatient(patient).subscribe(
      () => {
        this.snackBar.open('Patient updated successfully', 'Close', {
                  duration: 5000,
                  verticalPosition: 'top',
                });
        patient.editMode = false;
      },
      (error) => {
        this.snackBar.open('Error updating patient', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
        });
      }
    );
  }
}
