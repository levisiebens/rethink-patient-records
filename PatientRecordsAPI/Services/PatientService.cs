using System.Globalization;
using CsvHelper;
using EFCore.BulkExtensions;
using System.ComponentModel.DataAnnotations;

public class PatientService
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="PatientService"/> class.
    /// </summary>
    /// <param name="context">The application database context.</param>
    public PatientService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Adds a patient to the system.
    /// </summary>
    /// <param name="patient">The patient object to be added.</param>
    public void AddPatient(Patient patient)
    {
        _context.Patients.Add(patient);
        _context.SaveChanges();
    }

    /// <summary>
    /// Retrieves a list of patients based on the provided search criteria.
    /// </summary>
    /// <param name="searchModel">The search model containing the criteria to filter the patients.</param>
    /// <returns>An IEnumerable of Patient objects that match the search criteria.</returns>
    public IEnumerable<Patient> GetPatients(PatientSearchModel searchModel)
    {
        var query = _context.Patients.AsQueryable();

        if (!string.IsNullOrEmpty(searchModel.NameFilter))
        {
            query = query.Where(p => p.FirstName.Contains(searchModel.NameFilter) || 
                                    p.LastName.Contains(searchModel.NameFilter));
        }

        if (!string.IsNullOrEmpty(searchModel.OrderBy))
        {
            switch (searchModel.OrderBy)
            {
                case "FirstName":
                    query = searchModel.OrderDescending ? query.OrderByDescending(p => p.FirstName) 
                                                        : query.OrderBy(p => p.FirstName);
                    break;
                case "LastName":
                    query = searchModel.OrderDescending ? query.OrderByDescending(p => p.LastName) 
                                                        : query.OrderBy(p => p.LastName);
                    break;
            }
        }

        return query.ToList();
    }

    /// <summary>
    /// Updates the details of an existing patient in the system.
    /// </summary>
    /// <param name="patient">The patient object with updated details.</param>
    public void UpdatePatient(Patient patient)
    {
        _context.Patients.Update(patient);
        _context.SaveChanges();
    }

    /// <summary>
    /// Uploads patients' data from a CSV file.
    /// </summary>
    /// <param name="csvFile">The CSV file containing patient data.</param>
    /// <returns>A task that represents the asynchronous operation of adding patients to the database.</returns>
    public async Task UploadPatientsFromCsv(IFormFile csvFile)
    {
        try
        {
            using var reader = new StreamReader(csvFile.OpenReadStream());
            var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var patients = csv.GetRecords<Patient>().ToList();

            var validationErrors = new List<string>();
            
            foreach (var patient in patients)
            {
                // Trim and clean data
                patient.FirstName = patient.FirstName?.Trim();
                patient.LastName = patient.LastName?.Trim();

                // Validate the patient data
                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(patient, serviceProvider: null, items: null);
                bool isValid = Validator.TryValidateObject(patient, context, validationResults, true);

                if (!isValid)
                {
                    validationErrors.Add($"Validation failed for patient {patient.FirstName} {patient.LastName}. Errors: {string.Join(", ", validationResults.Select(v => v.ErrorMessage))}");
                }
            }

            if (validationErrors.Any())
            {
                throw new ApplicationException($"Validation errors occurred: {string.Join("; ", validationErrors)}");
            }

            await _context.BulkInsertAsync(patients);
        }
        catch (Exception ex)
        {
            throw new ApplicationException("An error occurred while uploading patients from CSV.", ex);
        }
    }
}
