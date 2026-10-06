<?php

namespace App\Actions;

use League\CommonMark\GithubFlavoredMarkdownConverter;
use Mews\Purifier\Facades\Purifier;

class RenderMarkdown
{
    public function handle(string $markdown): string
    {
        $html = (new GithubFlavoredMarkdownConverter)->convert($markdown)->getContent();

        return Purifier::clean($html);
    }
}
