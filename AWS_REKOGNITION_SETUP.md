# AWS Rekognition Setup - Step by Step

**Durasi**: 15 menit  
**Cost**: FREE untuk 12 bulan pertama (AWS Free Tier)  
**Kesulitan**: Mudah

---

## 🎯 Apa itu AWS Rekognition?

AWS Rekognition adalah layanan AI dari Amazon yang bisa:
- ✅ Detect wajah di foto/video
- ✅ Recognize siapa orang tersebut (dari database wajah)
- ✅ Score confidence (seberapa yakin match-nya)

Aplikasi CCTV kamu akan pake ini untuk identify karyawan/visitor otomatis.

---

## 💰 Berapa Cost-nya?

```
Per 1000 face detection: $0.006 (= 6 cent)
Per 1000 face index: $0.015 (= 1.5 cent)

Contoh:
- Register 100 karyawan = $0.0015 (sepele)
- Detect 10,000 faces per hari = $0.06/hari = $1.80/bulan
- Detect 100,000 faces per hari = $0.60/hari = $18/bulan

✅ FREE: Pertama 12 bulan mendapat free tier (sampai 1 million requests)
```

---

## 📝 **STEP 1: Create AWS Account (5 menit)**

### 1.1 Go to AWS
```
https://aws.amazon.com/free/
```

### 1.2 Click "Create Free Account"
```
Isikan:
- Email address: your_email@company.com
- Password: Strong password (min 8 char)
- AWS Account Name: MyCompany
- Account Type: Personal
```

### 1.3 Verify Email
```
Amazon akan kirim email verify
Click link di email tersebut
```

### 1.4 Add Payment Method
```
Harus ada credit card (tidak akan di-charge sampai exceed free tier)
Visa/Mastercard OK
```

### 1.5 Verify Identity
```
Amazon akan kirim SMS dengan OTP
Masukkan OTP
```

### 1.6 Choose Plan
```
Click "Free Plan" (atau Basic Plan)
```

**Done! AWS Account created** ✅

---

## 🔑 **STEP 2: Create IAM User untuk CCTV App (3 menit)**

**Jangan** pake AWS root account. Create IAM user khusus untuk app.

### 2.1 Login ke AWS Console
```
https://console.aws.amazon.com/
```

### 2.2 Go to IAM
```
Search bar: "IAM"
Click: "Identity and Access Management"
```

### 2.3 Create User
```
Left menu: "Users"
Click: "Create User"

Isi:
- User name: cctv-api
- Uncheck: "Provide user access to AWS Management Console"
- Check: "Provide access key-based authentication"

Click: "Create User"
```

### 2.4 Set Permissions
```
User created!

Go to: "Permissions" tab
Click: "Add Permissions" → "Attach policies directly"

Search: "Rekognition"
Check: "AmazonRekognitionFullAccess"

Search: "S3"
Check: "AmazonS3FullAccess"

Click: "Review and add permissions"
Click: "Add permissions"
```

### 2.5 Create Access Key
```
Go to: "Security Credentials" tab
Click: "Create access key"

Choose: "Application running outside AWS"
Click: "Next"

Optional description: "CCTV Application"
Click: "Create access key"
```

### 2.6 Save Access Key
```
PENTING! Save informasi ini:

Access Key ID: xxxxxxxxxxxxxx
Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Click: "Download .csv file" (untuk backup)
Click: "Done"
```

**Jangan share credentials ini dengan siapa-siapa!**

---

## 🪣 **STEP 3: Create S3 Bucket (2 menit)**

S3 bucket untuk menyimpan foto wajah.

### 3.1 Go to S3
```
Search bar: "S3"
Click: "S3" (Simple Storage Service)
```

### 3.2 Create Bucket
```
Click: "Create Bucket"

Bucket name: cctv-faces-YOUR-COMPANY
(Harus unique globally, jadi tambah nama company)

Region: us-east-1 (sama dengan Rekognition region)

Click: "Create bucket"
```

### 3.3 Configure Bucket (Optional)
```
Untuk production, enable versioning:
- Click bucket name
- Go to: "Properties"
- Enable: "Versioning"
- Click: "Enable versioning"
```

**Done! S3 Bucket created** ✅

---

## 👤 **STEP 4: Create Rekognition Collections (2 menit)**

Collection = database wajah.

Kita akan buat 2 collection:
- `employees` → wajah karyawan
- `visitors` → wajah visitor

### 4.1 Install AWS CLI (di server)

```bash
# SSH ke server
ssh ubuntu@192.168.1.100

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

### 4.2 Configure AWS CLI

```bash
# Configure credentials
aws configure

# Masukkan:
AWS Access Key ID: [paste dari Step 2.6]
AWS Secret Access Key: [paste dari Step 2.6]
Default region name: us-east-1
Default output format: json
```

### 4.3 Create Collections

```bash
# Create employees collection
aws rekognition create-collection \
  --collection-id employees \
  --region us-east-1

# Create visitors collection
aws rekognition create-collection \
  --collection-id visitors \
  --region us-east-1

# Verify
aws rekognition list-collections --region us-east-1

# Output harusnya:
# {
#     "CollectionIds": [
#         "employees",
#         "visitors"
#     ]
# }
```

**Done! Collections created** ✅

---

## 🔧 **STEP 5: Update .env di Server (1 menit)**

### 5.1 Edit .env

```bash
# Di server
cd ~/cctv-dashboard
nano .env

# Ubah dari:
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET=cctv-faces-bucket

# Jadi:
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET=cctv-faces-YOUR-COMPANY

# Save (Ctrl+O, Enter, Ctrl+X)
```

### 5.2 Restart Backend

```bash
docker-compose restart backend

# Wait 5 seconds
sleep 5

# Verify
curl http://localhost:8000/api/v1/health

# Check service status
docker-compose logs backend | grep -i "aws\|rekognition"
```

---

## ✅ **STEP 6: Test Rekognition (3 menit)**

### 6.1 Register Employee dengan Foto

**Via Dashboard:**
1. Open `http://server_ip:3000`
2. Login
3. Go to: "Employees" → "Register"
4. Isi form:
   - Name: John Doe
   - Email: john@company.com
   - Department: Engineering
   - Upload foto
5. Click "Register"

**Via API:**
```bash
# Di server atau laptop dengan file foto
curl -X POST "http://192.168.1.100:8000/api/v1/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=John Doe" \
  -F "email=john@company.com" \
  -F "department=Engineering" \
  -F "photo=@/path/to/photo.jpg"

# Harusnya response:
# {
#   "emp_id": "emp_001",
#   "face_id": "aws-face-id-xyz",
#   "status": "success"
# }
```

### 6.2 Test Face Detection

**Via Dashboard:**
1. Go to: "Detection"
2. Upload foto orang yang sama
3. Click "Search"
4. Harusnya match dengan employee yang sudah registered

**Via API:**
```bash
curl -X POST "http://192.168.1.100:8000/api/v1/detection/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/test_photo.jpg" \
  -F "collection=employees"

# Harusnya response:
# {
#   "matches": [
#     {
#       "person_id": "emp_001",
#       "name": "John Doe",
#       "confidence": 95.5,
#       "face_id": "aws-face-id-xyz"
#     }
#   ]
# }
```

**Berhasil! Rekognition working!** ✅

---

## 💡 **TIPS & BEST PRACTICES**

### Foto Requirements
- Format: JPG atau PNG
- Size: min 100x100 pixel, max 5MB
- Clear face: Wajah harus jelas dan menghadap kamera
- Lighting: Cukup cahaya, tidak terlalu gelap

### Confidence Threshold
```python
# Default threshold: 70%
# Artinya: match harus 70% confident

# Naikkan threshold untuk lebih strict:
threshold = 85  # Hanya accept 85%+ matches

# Turunkan untuk lebih loose:
threshold = 60  # Accept 60%+ matches
```

### Cost Optimization
```bash
# 1. Batch process faces
# Jangan process setiap frame
# Process setiap 5 detik saja

# 2. Cache results
# Jangan search ulang untuk frame yang sama

# 3. Delete unneeded faces
aws rekognition delete-face \
  --collection-id employees \
  --face-ids "face-id-to-delete" \
  --region us-east-1
```

---

## 🛡️ **SECURITY**

### Jangan Lakukan:
- ❌ Share AWS credentials
- ❌ Commit credentials ke GitHub
- ❌ Use root AWS account
- ❌ Public S3 bucket access

### Yang Harus Dilakukan:
- ✅ Use IAM user dengan limited permissions
- ✅ Rotate access keys regularly
- ✅ Enable CloudTrail untuk audit
- ✅ Use S3 encryption
- ✅ Keep .env file secure

### Enable S3 Encryption

```bash
# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket cctv-faces-YOUR-COMPANY \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }' \
  --region us-east-1
```

---

## 📊 **MONITORING AWS COSTS**

### Check Current Costs

```bash
# Via CLI
aws ce get-cost-and-usage \
  --time-period Start=2026-05-01,End=2026-05-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Via Console
```
1. Go to AWS Console
2. Search: "Billing"
3. Click: "Billing Dashboard"
4. Lihat current month charges
```

### Set Budget Alert

```
1. Go to AWS Billing
2. Click: "Budgets"
3. Create Budget
4. Set limit (e.g., $100/month)
5. AWS akan alert jika exceed
```

---

## 🆘 **TROUBLESHOOTING**

### AWS Credentials Not Working
```bash
# Verify credentials
aws sts get-caller-identity

# Output harusnya:
# {
#     "UserId": "AIDAI...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/cctv-api"
# }

# Jika error:
# Re-run: aws configure
```

### Collection Not Found
```bash
# List collections
aws rekognition list-collections --region us-east-1

# Jika tidak ada:
# Create ulang:
aws rekognition create-collection \
  --collection-id employees \
  --region us-east-1
```

### Face Detection Not Working
```bash
# Check logs
docker-compose logs backend | grep -i rekognition

# Jika error "InvalidParameterException":
# - Foto terlalu kecil (min 100x100)
# - Format tidak support (harus JPG/PNG)
# - Size terlalu besar (max 5MB)
```

### AccessDenied Error
```bash
# Check IAM permissions
aws iam get-user-policy --user-name cctv-api --policy-name AmazonRekognitionFullAccess

# Jika hilang, attach ulang:
aws iam attach-user-policy \
  --user-name cctv-api \
  --policy-arn arn:aws:iam::aws:policy/AmazonRekognitionFullAccess
```

---

## 🎓 **NEXT STEPS**

1. **Setup Done!** ✅
   - AWS Account created
   - IAM User created
   - S3 Bucket created
   - Collections created
   - Credentials configured

2. **Now You Can:**
   - Register employees dengan foto
   - Auto-detect wajah dari CCTV
   - Track attendance otomatis
   - Identify visitor otomatis

3. **Advanced (Later):**
   - Add multiple collections
   - Setup face search API
   - Integrate camera streams
   - Add alert notifications
   - Setup monitoring

---

## 📞 **QUICK REFERENCE**

```bash
# Test AWS connection
aws sts get-caller-identity

# List collections
aws rekognition list-collections --region us-east-1

# List S3 buckets
aws s3 ls

# Check API health
curl http://localhost:8000/api/v1/health

# Check Rekognition status in logs
docker-compose logs backend | grep -i aws
```

---

## 💡 **Cost Examples**

```
Scenario: Small Office (50 employees, 100 daily visitors)

Low usage (500 detections/day):
├─ Detection cost: 500 * $0.006 = $3/day = $90/month
├─ Index cost: 50 employees = $0.75 (one-time)
└─ Total: ~$90-100/month

Medium usage (5,000 detections/day):
├─ Detection cost: 5,000 * $0.006 = $30/day = $900/month
├─ Index cost: per new employee
└─ Total: ~$900-1,000/month

Note: First 12 months = FREE (AWS Free Tier)
```

---

**AWS Setup Complete!** ✅  
**Siap pakai untuk production!** 🚀

Next: Baca `DEPLOYMENT_STEP_BY_STEP_LINUX.md` untuk deploy aplikasi.
