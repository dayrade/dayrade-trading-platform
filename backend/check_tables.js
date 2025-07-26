require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  try {
    console.log('='.repeat(60));
    console.log('SUPABASE DATABASE TABLES ANALYSIS');
    console.log('='.repeat(60));
    
    // List of tables to check based on the schema
    const tablesToCheck = [
      'users',
      'tournaments', 
      'tournament_participants',
      'trading_performance',
      'trades',
      'chat_messages',
      'commentary'
    ];
    
    let existingTables = [];
    let totalTables = 0;
    
    console.log('\nChecking tables...\n');
    
    for (const tableName of tablesToCheck) {
      try {
        // Check if table exists and get row count
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          totalTables++;
          existingTables.push(tableName);
          
          console.log(`✅ Table: ${tableName}`);
          console.log(`   Rows: ${count || 0}`);
          
          // Get table structure by trying to select with limit 0
          const { data: structure, error: structError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          if (!structError) {
            // Try to get one row to see actual structure
            const { data: sample, error: sampleError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (!sampleError && sample && sample.length > 0) {
              console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`);
              console.log(`   Sample data available: Yes`);
            } else {
              console.log(`   Columns: Unable to determine (table empty)`);
              console.log(`   Sample data available: No`);
            }
          }
          
        } else {
          console.log(`❌ Table: ${tableName}`);
          console.log(`   Error: ${error.message}`);
        }
        
        console.log('');
        
      } catch (e) {
        console.log(`❌ Table: ${tableName}`);
        console.log(`   Error: ${e.message}`);
        console.log('');
      }
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tables found: ${totalTables}`);
    console.log(`Existing tables: ${existingTables.join(', ')}`);
    
    if (totalTables === 0) {
      console.log('\n⚠️  No tables found in the database!');
      console.log('   This might indicate:');
      console.log('   - Database is empty');
      console.log('   - Tables haven\'t been created yet');
      console.log('   - Permission issues');
    } else {
      console.log(`\n✅ Database contains ${totalTables} tables`);
      
      // Check if all expected tables exist
      const missingTables = tablesToCheck.filter(table => !existingTables.includes(table));
      if (missingTables.length > 0) {
        console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Fatal Error:', error);
  }
}

checkTables();