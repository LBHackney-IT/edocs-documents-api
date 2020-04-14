# Run with 'powershell -ExecutionPolicy Bypass -File test1.ps1'

$library = 'CDM'
$docNumber = '22233716'
$docNumber = '8671310'

add-type -path 'C:\Program Files\Open Text\DM API\Hummingbird.DM.Server.Interop.PCDClient.dll'

$PDCLogin = New-object Hummingbird.DM.Server.Interop.PCDClient.PCDLoginClass

$rc = $PDCLogin.AddLogin(0, $library, 'ROOTWF', 'ROOTWF')
$rc = $PDCLogin.Execute()
if ($rc -ne 0)
{
   throw $PDCLogin.ErrDescription
}
 
# Get the login token ("DST")
$dst = $PDCLogin.GetDST()
Write-Host "DST is `"$dst`""

# -------------------------------------------------------------------------------
# Search for metadata for the document
$obj = New-object Hummingbird.DM.Server.Interop.PCDClient.PCDSearchClass
[void]$obj.SetDST($dst)
[void]$obj.AddSearchLib($library)
[void]$obj.SetSearchObject('DEF_PROF')
[void]$obj.AddSearchCriteria('DOCNUMBER', $docNumber)
$prop = 'PATH'		
[void]$obj.AddReturnProperty($prop)
[void]$obj.AddReturnProperty('DOCNAME')

$rc=$obj.Execute()
if ($rc -ne 0)
{
  throw $obj.ErrDescription		
}

[void]$obj.SetRow(1)

$docname = $obj.GetPropertyValue('DOCNAME')
Write-Host "Doc name: $docname"
$obj.GetPropertyValue($prop)

[void]$obj.ReleaseResults()

# -------------------------------------------------------------------------------
# Get the document file type
$sql = New-Object Hummingbird.DM.Server.Interop.PCDClient.PCDSQLClass
[void]$sql.SetDST($dst)
$rc = $sql.Execute("SELECT PATH FROM DOCSADM.COMPONENTS WHERE DOCNUMBER = $docNumber")
if ($rc -ne 0)
{
   throw $sql.ErrDescription
}
[void]$sql.SetRow(1)
$path = $sql.GetColumnValue(1)
Write-Host "Path: $path"
$tokens = $path.split('.')
$fileType = $tokens[-1].ToLower()
Write-Host "File type: $fileType"

# -------------------------------------------------------------------------------
# Search for version for the document
$obj = New-object Hummingbird.DM.Server.Interop.PCDClient.PCDSearchClass
[void]$obj.SetDST($dst)
[void]$obj.AddSearchLib($library)
[void]$obj.SetSearchObject('cyd_cmnversions')
[void]$obj.AddSearchCriteria('DOCNUMBER', $docNumber)
[void]$obj.AddOrderByProperty("VERSION", 0)
[void]$obj.AddReturnProperty('VERSION')
[void]$obj.AddReturnProperty('VERSION_ID')

$rc=$obj.Execute()
if ($rc -ne 0)
{
  throw $obj.ErrDescription		
}

[void]$obj.SetRow(1)
$version = $obj.GetPropertyValue('VERSION')
$versionId = $obj.GetPropertyValue('VERSION_ID')

Write-Host "Version: $version Version ID: $versionId"
[void]$obj.ReleaseResults()

# -------------------------------------------------------------------------------
# Download the actual document
$getobj = New-object Hummingbird.DM.Server.Interop.PCDClient.PCDGetDocClass
[void]$getobj.SetDST($dst)
[void]$getObj.AddSearchCriteria('%TARGET_LIBRARY', $library)
[void]$getObj.AddSearchCriteria('%VERSION_ID', $versionId)
[void]$getObj.AddSearchCriteria('%DOCUMENT_NUMBER', $docNumber)
$rc = $getObj.Execute()

if ($rc -ne 0)
{
  throw $obj.ErrDescription		
}

[void]$getObj.NextRow()
$content = $getObj.GetPropertyValue('%CONTENT')

$filename = "$docNumber.$fileType"
$to =  New-object System.IO.FileStream $fileName, Create, ReadWrite
$bytesRead = 1

Do {
  $data = $content.Read(1024, [ref]1)
  $bytesRead = $content.BytesRead
  # Write-Host "Bytes Read: $bytesRead"
  [void]$to.Write($data, 0, $bytesRead)
} While ($bytesRead -gt 0)

Write-Host "File saved"

[void]$to.Close()
 
[void]$obj.ReleaseResults()