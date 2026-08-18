/**
 * Utility to validate if a candidate's profile is complete before unlocking certification exams.
 * EXCLUDES optional fields: linkedin (LinkedIn URL) and portfolio (Portfolio/GitHub URL).
 */
export function checkProfileCompleteness(profile) {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ['Full Name', 'Email', 'Mobile Number', 'Gender', 'Age', 'Role Type', 'Designation', 'Department', 'Organization', 'State', 'District', 'Block / City']
    };
  }

  const missingFields = [];

  const fullName = profile.full_name || profile.fullName || profile.name || '';
  if (!fullName.trim()) missingFields.push('Full Name');

  const email = profile.email || '';
  if (!email.trim()) missingFields.push('Email');

  const mobile = profile.mobile || profile.phone || '';
  if (!mobile.trim() || mobile.trim() === 'N/A') missingFields.push('Mobile Number');

  const gender = profile.gender || '';
  if (!gender.trim()) missingFields.push('Gender');

  const age = profile.age;
  if (!age || isNaN(parseInt(age, 10)) || parseInt(age, 10) <= 0) missingFields.push('Age');

  const roleType = profile.role_type || profile.roleType || profile.role || '';
  if (!roleType.trim()) missingFields.push('Role Type');

  const designation = profile.designation || '';
  if (!designation.trim()) missingFields.push('Designation');

  const department = profile.department || '';
  if (!department.trim()) missingFields.push('Department');

  const organization = profile.organization || '';
  if (!organization.trim()) missingFields.push('Organization');

  const state = profile.state || '';
  if (!state.trim()) missingFields.push('State');

  const district = profile.district || '';
  if (!district.trim()) missingFields.push('District');

  const blockCity = profile.block_city || profile.blockCity || profile.city || '';
  if (!blockCity.trim()) missingFields.push('Block / City');

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}
