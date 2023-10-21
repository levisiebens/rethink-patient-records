using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PatientController : ControllerBase
{
    private readonly PatientService _patientService;

    public PatientController(PatientService patientService)
    {
        _patientService = patientService;
    }

    // Endpoint to upload CSV file with patient records
    [HttpPost("upload")]
    public async Task<IActionResult> UploadCsvFile([FromForm] UploadModel uploadModel)
    {
        if (uploadModel.CsvFile == null || uploadModel.CsvFile.Length == 0)
            return BadRequest("No file selected or file is empty.");

        try
        {
            await _patientService.UploadPatientsFromCsv(uploadModel.CsvFile);
            return Ok("Patients uploaded successfully.");
        }
        catch (Exception ex)
        {
            // You might want to log the exception here
            return BadRequest(ex.Message);
        }
    }

    // Endpoint to get all patients, possibly with some filtering/ordering
    [HttpGet]
    public ActionResult<IEnumerable<Patient>> GetAllPatients([FromQuery] PatientSearchModel searchModel)
    {
        var patients = _patientService.GetPatients(searchModel);
        return Ok(patients);
    }

    // Endpoint to edit a patient record
    [HttpPut("{id}")]
    public IActionResult UpdatePatient(int id, [FromBody] Patient patient)
    {
        if (id != patient.Id)
            return BadRequest("Patient ID mismatch.");

        try
        {
            _patientService.UpdatePatient(patient);
            return Ok("Patient updated successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
