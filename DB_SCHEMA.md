# Database Schema (Matrimony Grade)

## 1. Users (Identity)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `email` | VARCHAR | Unique, Verified |
| `phone` | VARCHAR | Unique, Verified |
| `password_hash` | VARCHAR | Argon2 |
| `is_verified` | BOOLEAN | KYC Status |

## 2. Profiles (The Biodata)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID | FK -> Users |
| `name` | VARCHAR | |
| `dob` | DATE | Age calculation |
| `height_cm` | INT | |
| `gender` | ENUM | Male, Female |
| `marital_status` | ENUM | Never Married, Divorced, Widowed, Awaiting Divorce |
| `mother_tongue` | VARCHAR | |
| `city` | VARCHAR | |
| `state` | VARCHAR | |
| `country` | VARCHAR | |

## 3. Religion_Community (MANDATORY)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID | FK |
| `religion` | VARCHAR | Hindu, Muslim, Christian, Sikh, etc. |
| `caste` | VARCHAR | |
| `sub_caste` | VARCHAR | Optional |
| `gothra` | VARCHAR | Optional |
| `inter_caste_willingness`| ENUM | Yes, No, Open |

## 4. Career_Education
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID | FK |
| `education_level` | ENUM | High School, Bachelors, Masters, Doctorate |
| `profession` | VARCHAR | |
| `company` | VARCHAR | |
| `income_range` | VARCHAR | e.g. "15-20 LPA" |
| `work_location` | VARCHAR | |

## 5. Family_Details
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID | FK |
| `type` | ENUM | Nuclear, Joint |
| `values` | ENUM | Orthodox, Traditional, Moderate, Liberal |
| `father_occ` | VARCHAR | |
| `mother_occ` | VARCHAR | |
| `siblings` | VARCHAR | e.g. "1 Brother, 0 Sisters" |

## 6. Lifestyle_Habits
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID | FK |
| `diet` | ENUM | Veg, Non-Veg, Eggitarian, Vegan |
| `smoke` | ENUM | No, Occasionally, Yes |
| `drink` | ENUM | No, Socially, Yes |
| `spiritual_inclination` | VARCHAR | |

## 7. Interests_Personality
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID | FK |
| `hobbies` | JSONB | e.g. ["Reading", "Hiking"] |
| `comm_style` | VARCHAR | |
| `introvert_scale` | INT | 1 (Introvert) to 10 (Extrovert) |
