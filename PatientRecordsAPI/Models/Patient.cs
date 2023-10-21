using System.ComponentModel.DataAnnotations;
using CsvHelper.Configuration.Attributes;

/// <summary>
/// Represents a patient's personal details.
/// </summary>
public class Patient
{
    [Ignore]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the patient's first name.
    /// </summary>
    [Name("First Name")]
    [Required]
    [MinLength(1)]
    [MaxLength(50)]
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the patient's last name.
    /// </summary>
    [Name("Last Name")]
    [Required]
    [MinLength(1)]
    [MaxLength(50)]
    public string LastName { get; set; }

    /// <summary>
    /// Gets or sets the patient's date of birth.
    /// </summary>
    [Required]
    [DataType(DataType.Date)]
    public DateTime Birthday { get; set; }

    /// <summary>
    /// Gets or sets the patient's gender.
    /// </summary>
    [Required]
    public Gender Gender { get; set; }
}
