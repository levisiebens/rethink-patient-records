public class PatientSearchModel
{
    public string NameFilter { get; set; }  = string.Empty;
    public string OrderBy { get; set; }  = "FirstName";
    public bool OrderDescending { get; set; } = false;
}
