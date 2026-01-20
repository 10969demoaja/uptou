<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductCategoryController extends Controller
{
    public function index(Request $request)
    {
        $level = $request->query('level');
        $parentId = $request->query('parent_id');
        $limit = (int) $request->query('limit', 100);

        if (ProductCategory::count() === 0) {
            $this->seedFromJsonIfEmpty();
        }

        $query = ProductCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($level !== null) {
            $query->where('level', (int) $level);
        }

        if ($parentId) {
            $query->where('parent_id', $parentId);
        }

        if ($request->query('include_children')) {
            $query->with(['children' => function($q) {
                $q->where('is_active', true)->orderBy('sort_order')->orderBy('name');
            }]);
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        $categories = $query->get();

        return response()->json([
            'error' => false,
            'data' => [
                'categories' => $categories,
            ],
        ]);
    }

    protected function seedFromJsonIfEmpty(): void
    {
        $path = base_path('../frontend/KATEGORI/kategori.json');

        if (! file_exists($path)) {
            return;
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (! is_array($data)) {
            return;
        }

        foreach ($data as $i => $top) {
            $name1 = isset($top['kategori1']) ? html_entity_decode($top['kategori1'], ENT_QUOTES, 'UTF-8') : null;

            if (! $name1) {
                continue;
            }

            $level1 = ProductCategory::create([
                'name' => $name1,
                'slug' => Str::slug($name1),
                'description' => null,
                'icon' => null,
                'parent_id' => null,
                'level' => 1,
                'sort_order' => $i,
                'is_active' => true,
            ]);

            $kategori2List = $top['kategori2'] ?? [];

            foreach ($kategori2List as $j => $cat2) {
                $name2 = isset($cat2['nama']) ? html_entity_decode($cat2['nama'], ENT_QUOTES, 'UTF-8') : null;

                if (! $name2) {
                    continue;
                }

                $level2 = ProductCategory::create([
                    'name' => $name2,
                    'slug' => Str::slug($level1->slug.'-'.$name2),
                    'description' => null,
                    'icon' => null,
                    'parent_id' => $level1->id,
                    'level' => 2,
                    'sort_order' => $j,
                    'is_active' => true,
                ]);

                $kategori3List = $cat2['kategori3'] ?? [];

                foreach ($kategori3List as $k => $name3Raw) {
                    $name3 = $name3Raw ? html_entity_decode($name3Raw, ENT_QUOTES, 'UTF-8') : null;

                    if (! $name3) {
                        continue;
                    }

                    ProductCategory::create([
                        'name' => $name3,
                        'slug' => Str::slug($level2->slug.'-'.$name3),
                        'description' => null,
                        'icon' => null,
                        'parent_id' => $level2->id,
                        'level' => 3,
                        'sort_order' => $k,
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
