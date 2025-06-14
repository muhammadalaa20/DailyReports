# DailyReports

A fullstack app to record our team's tasks in the form of daily reports for each shift.




## Frontend

Javascript, HTML, CSS, TailwindCss, Nextjs, State Management, Motion

## Backend

Nodejs, Express, mysql12 and jwt

## Database

SQL
## Installation

Install with npm

```bash
  npm install
```
    
## SQL DATABASE

 CREATE DATABASE DailyReports;
```bash

 -- Table to store reports
 CREATE TABLE reports (
     id INT AUTO_INCREMENT PRIMARY KEY,
     report_date DATE NOT NULL,
     shift ENUM('Morning', 'Evening', 'Night') NOT NULL
     CONSTRAINT unique_report_date_shift UNIQUE (report_date, shift)
 );
```
```bash

 -- Table to store tasks
 CREATE TABLE tasks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     report_id INT NOT NULL,
     category ENUM('Engineers', 'IT-specialists', 'PC', 'Printer', 'VM3', 'PDA', 'RDT', 'Network', 'OCR', 'ERP', 'CATOS', 'EDI', 'Others') NOT NULL,
     action_taken TEXT NOT NULL,
     result TEXT NOT NULL,
     FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
 );
```
```bash


-- CREATE TABLE users (
   id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) NOT NULL UNIQUE,
   password VARCHAR(255) NOT NULL,
   role ENUM('act', 'dct') NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

```

## DEMO

![App Demo](https://github.com/muhammadalaa20/DailyReports/blob/main/dailyreports.gif)


## Authors

- [@muhammadalaa20](https://github.com/muhammadalaa20)
- [@elgendyud](https://github.com/elgendyud)
