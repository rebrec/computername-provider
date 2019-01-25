param(
	[switch]$Dry#=$True
)


$API_PROTOCOL 	= 'http'
$API_HOST 		= 'localhost'
$API_PORT 		= 8089
$API_ENDPOINT	= 'api'

Function getComputerList {
    param(
		$serial
	)
    Try {
        $url = "$API_PROTOCOL" + ":" + "//" + "$API_HOST" + ":" + "$API_PORT/$API_ENDPOINT/get_computer_list"
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


Function updateComputerInfos {
    param(
		$infos
	)
    Try {
        $url = "$API_PROTOCOL" + ":" + "//" + "$API_HOST" + ":" + "$API_PORT/$API_ENDPOINT/update_computer_infos"
        $jsonInfos = ConvertTo-JSON $infos
        Write-Host "Sending PUT Request $url with infos : $jsonInfos"
		
		$state = Invoke-RestMethod -Method Put -Uri $url -ContentType 'application/json' -Body $jsonInfos
        if ($state.status -ne 'success'){ 
			Write-Host "Error calling updateComputerInfos, returned non successfull value"
			Write-Host "Something went wrong while running updateComputerInfos function. Result is $(ConvertTo-JSON $state)"
			
			return $false
		}
		Write-Host "updateComputerInfos : done"
		return $state.data
    
    }
    Catch {
		Write-Error $_.Exception.Message
        return $false
    }
}
	
	

Function getComputerList {
    param(
		$serial
	)
    Try {
        $url = "$API_PROTOCOL" + ":" + "//" + "$API_HOST" + ":" + "$API_PORT/$API_ENDPOINT/get_computer_list"
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


# create a backup
getComputerList | Export-Csv "./backup-$API_HOST-$(get-date -f MM-dd-yyyy_HH_mm_ss).csv"

getComputerList | % {
	$hostInfo = $_
	$hostInfo.taskSequenceID = "WIN7-X64"
	$hostInfo.domainJoin = "True"
	updateComputerInfos $hostInfo
}