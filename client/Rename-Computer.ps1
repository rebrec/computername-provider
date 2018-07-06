param(
	[switch]$Dry#=$True
)


$API_PROTOCOL 	= 'http'
$API_HOST 		= 'localhost'
$API_PORT 		= 8089
$API_ENDPOINT	= 'api'


Function getComputerName {
    param(
		$serial
	)
    Try {
        $url = "$API_PROTOCOL" + ":" + "//" + "$API_HOST" + ":" + "$API_PORT/$API_ENDPOINT/get_computer_name?serial=" + $serial
        Write-Host "Sending GET Request $url"
        $request = [System.Net.HttpWebRequest]::Create($url)
        $request.Method = "GET"
        #$request.ContentType = "application/json"

        $state = Invoke-RestMethod -Method Get -Uri $url
        if ($state.status -ne 'success'){ 
            Write-Host "Error calling getComputerName, returned non successfull value"
            # Check wether the Log function is defined :
            Write-Error "Cannot retrieve computerName"
            Write-Error $state.message
            return $false 
        }
        $res = $($state.data)    
        return $res
    }
    Catch {
		Write-Error $_.Exception.Message
        return $false
    }
}

Function Main{
	param()
	$serial = $(Get-WmiObject -query "select * from win32_bios").SerialNumber
	$res = getComputerName($serial)
	if ($res -eq $false) { return -1 }
	Write-Host "Received Hostname : $($res.hostname)"
	try{
		if ($Dry -ne $true){
			Rename-Computer -NewName $($res.hostname)
		}
		Write-Host "Success, Restarting in 10 seconds"
		Start-Sleep -Seconds 10
		Write-Host "Restarting now"

		if ($Dry -ne $true){
			Restart-Computer -Force
		}
	}
	Catch {
	}
}



# For compatibility with Powershell v2
if ($PSVersionTable.PSVersion -eq "2.0") {
	Function ConvertTo-JSON([object] $item){
		add-type -assembly system.web.extensions
		$ps_js=new-object system.web.script.serialization.javascriptSerializer
		return $ps_js.Serialize($item)
	}
    function ConvertFrom-Json([object] $item){ 
        add-type -assembly system.web.extensions
        $ps_js=new-object system.web.script.serialization.javascriptSerializer
    
        #The comma operator is the array construction operator in PowerShell
        return ,$ps_js.DeserializeObject($item)
    }
    function Invoke-RestMethod {
        param($Method,$Uri, $Body, $ContentType)
        $client = New-Object System.Net.WebClient
        if ($Method -ieq "Get"){
            $json = $client.DownloadString($Uri)
            $res = ConvertFrom-Json $json
            return $res
        } elseif ($Method -ieq "Put"){
            if ($PSBoundParameters.ContainsKey('ContentType')) {
                $client.Headers["Content-Type"] = $ContentType
            }
            $json = $client.UploadString($Uri, $Method, $Body)
            $res = ConvertFrom-Json $json
            return $res
        } else {
            throw "Unknown Method : $Method (only GET and PUT are currently implemented)"
        }
       
    }    

}



return Main