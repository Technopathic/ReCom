<?php

use Illuminate\Database\Seeder;

class FchannelsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
      $date = date('Y-m-d H:i:s');

      DB::table('fchannels')->insert([
        'id' => 1,
        'channelTitle' => 'No Channel',
        'channelDesc' => 'No Channel',
        'channelImg' => 'img/uncategorized.png',
        'channelSlug' => 'No-Channel',
        'channelArchived' => 0,
        'channelTopics' => 0,
        'created_at' => $date,
        'updated_at' => $date
      ]);
    }
}
