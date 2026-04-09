# Test Submit Evaluasi Fasilitas

# Step 1: Login  
Write-Output "=== Step 1: Login ==="
try {
  $loginBody = @{
    identifier = "210101001"
    password = "password123"
  } | ConvertTo-Json
  
  Write-Output "Request to: http://localhost:3002/api/auth/login"
  Write-Output "Body: $loginBody"
  
  $loginResp = Invoke-RestMethod -Method Post `
    -Uri 'http://localhost:3002/api/auth/login' `
    -ContentType 'application/json' `
    -Body $loginBody `
    -TimeoutSec 10
    
  Write-Output "✓ Login successful"
  Write-Output "Response: $($loginResp | ConvertTo-Json)"
  
  $token = $loginResp.data.token
  Write-Output "Token: $($token.Substring(0, 50))..."
  
  # Step 2: Submit Evaluasi
  Write-Output "`n=== Step 2: Submit Evaluasi Fasilitas ==="
  
  $evalBody = @{
    fasilitas_id = 1
    periode_id = 1
    komentar = "Ruang kelas bagus"
    jawaban = @(
      @{pernyataan_id = 15; nilai = 5}
    )
  } | ConvertTo-Json
  
  Write-Output "Request to: http://localhost:3002/api/evaluasi/fasilitas"
  Write-Output "Body: $evalBody"
  Write-Output "Token: $($token.Substring(0, 50))..."
  
  $evalResp = Invoke-RestMethod -Method Post `
    -Uri 'http://localhost:3002/api/evaluasi/fasilitas' `
    -Headers @{Authorization="Bearer $token"} `
    -ContentType 'application/json' `
    -Body $evalBody `
    -TimeoutSec 10
    
  Write-Output "✓ SUCCESS"
  Write-Output "Response: $($evalResp | ConvertTo-Json -Depth 5)"
  
} catch {
  Write-Output "✗ ERROR"
  Write-Output "Exception Type: $($_.Exception.GetType().Name)"
  Write-Output "Error: $($_.Exception.Message)"
  if ($_.ErrorDetails) {
    Write-Output "Error Details: $($_.ErrorDetails.Message)"
  }
}
